const express = require('express');
const router = express.Router();
const { createUser, loginUser, updateStats, decodeJwt } = require('../services/usersService');

// Creates a user
router.post('/create', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await createUser(username, password); // Implement this function

    res.json({ message: 'User created successfully', user });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logs in a user
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await loginUser(username, password);

    if (user.success) {
      res.json({ message: 'Login successful', user });
    } else {
      res.status(401).json({ error: 'Invalid username or password' });
    }
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Updates a users stats after a game ends
router.post('/updateStats', async (req, res) => {
  try {
    const { username, gamesWon, gamesPlayed, correctGuesses, totalGuesses } = req.body;
    await updateStats(username, gamesWon, gamesPlayed, correctGuesses, totalGuesses);

    res.json({ message: 'Player statistics updated successfully' });
  } catch (error) {
    console.error('Error updating player statistics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Decodoes a given jwt
router.post('/decodeJwt', async (req, res) => {
  try {
    const { token } = req.body;
    const username = await decodeJwt(token);
    console.log("username: "+ username.username);
    res.json({ username });
  } catch (error) {
    console.error('Error updating player statistics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



module.exports = router;
