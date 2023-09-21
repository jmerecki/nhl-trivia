const { getDbConnection } = require('../db/db');


const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'puckdoku_merecki',
};

// Db call to get user stats based on username
async function getUserStats(username) {
    try {
      const connection = await getDbConnection();
  
      const [results] = await connection.query(
        'select games_won, games_played, correct_guesses/total_guesses as correctGuessPct from users where username = ?',
        [username]
      );
  
      connection.releaseConnection();
  
      return results;
    } catch (error) {
      throw error;
    }
}

// Db call to get top 5 users
async function getTopFiveStats() {
    try {  
        const connection = await getDbConnection();
  
        const [results] = await connection.query(
          'select username, games_won, games_played, correct_guesses/total_guesses as correctGuessPct from users order by correctGuessPct desc limit 5'
        );
        connection.releaseConnection();
  
        return results;
      } catch (error) {
        throw error;
      }
}

  module.exports = {
    getUserStats,
    getTopFiveStats
  };
  