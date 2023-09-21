const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getDbConnection } = require('../db/db');

// Creates user in db
async function createUser(username, password) {
  const connection = await getDbConnection();
  try {
    const [existingUsers] = await connection.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (existingUsers.length > 0) {
      throw new Error('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password

    const [result] = await connection.query(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hashedPassword]
    );

    connection.releaseConnection();

    return result;
  } catch (error) {
    throw error;
  }
}

// Calls db to check if password matches
async function loginUser(username, password) {
  try {
    const connection = await getDbConnection();

    const [rows] = await connection.execute(
      'SELECT password FROM users WHERE username = ? LIMIT 1',
      [username]
    );
    connection.releaseConnection();

    if (rows.length === 0) {
      return { success: false, message: 'User not found' };
    }

    const { password: hashedPasswordFromDB } = rows[0];

    const passwordMatch = await bcrypt.compare(password, hashedPasswordFromDB);

    if (passwordMatch) {
      const token = jwt.sign({ username }, 'key123', {
        expiresIn: '1h', 
      });
      return {
        success: true,
        username: username,
        token: token,
        message: 'Login successful',
      };
    } else {
      return { success: false, message: 'Invalid username or password' };
    }
  } catch (error) {
    console.error('Error while logging in:', error);
    throw error;
  }
}

// Calls db to update a users stats
async function updateStats(username, gamesWon, gamesPlayed, correctGuesses, totalGuesses) {
  try {
    const connection = await getDbConnection();

    // Construct the SQL query to update the player's statistics
    const sql = `
      UPDATE users
      SET
        games_won = games_won + ?,
        games_played = games_played + ?,
        correct_guesses = correct_guesses + ?,
        total_guesses = total_guesses + ?
      WHERE username = ?
    `;

    const [result] = await connection.execute(sql, [gamesWon, gamesPlayed, correctGuesses, totalGuesses, username]);

    if (result.affectedRows > 0) {
      console.log(`Statistics updated successfully for user ${username}`);
    } else {
      console.error(`User ${username} not found or no records were updated`);
    }

    connection.releaseConnection();
  } catch (error) {
    console.error('Error while updating statistics:', error);
    throw error; 
  }
}

// Call to decode the jwt and return username
async function decodeJwt(token) {
  try {
    if (token) {
      const secretKey = 'key123';
      const decoded = jwt.verify(token, secretKey);
      // Return the decoded payload
      return decoded;
    } else {
      return { success: false, message: 'Invalid token' };
    }
  } catch (error) {
    console.error('Error while decoding JWT:', error);
    throw error;
  }
}

module.exports = {
  createUser,
  loginUser,
  updateStats,
  decodeJwt
};
