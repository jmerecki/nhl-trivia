const express = require('express');
const router = express.Router();
const { getRandomPlayers, getAllPlayers, checkGuess, getBoard, getAnswer } = require('../services/playersService');

// Generate 6 players that make up a valid board
router.get('/generatePlayers', async (req, res) => {
  try {
    const playerNames = await getRandomPlayers();
    res.json(playerNames);
  } catch (error) {
    console.error('Error fetching player names:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all players
router.get('/all', async (req, res) => {
  try {
    const playerNames = await getAllPlayers();
    res.json(playerNames);
  } catch (error) {
    console.error('Error fetching player names:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check if the selected player has played with player 1
// and player 2 at some point in their careers
router.post('/checkGuess', async (req, res) => {
  try {
    const { player1Id, player2Id, selectedPlayerId } = req.body; // Extract player IDs from the request body
    const isCorrect = await checkGuess(player1Id, player2Id, selectedPlayerId);
    res.json({ isCorrect });
  } catch (error) {
    console.error('Error checking guess:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Gets a valid board (6 players) 
router.get('/getBoard', async (req, res) => {
  try {
    const board = await getBoard();
    res.json({ board} );
  } catch (error) {
    console.error('Error checking guess:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Calls generatePlayers on loop to seed the valid_boards
// table in the database
router.get('/generateBoards', async (req, res) => {
  try {
    const numberOfBoardsToGenerate = 500;
    let generatedBoardCount = 0;

    for (let i = 0; i < numberOfBoardsToGenerate; i++) {
      await getRandomPlayers();
      generatedBoardCount++;
    }

    res.json({ generatedBoardCount });
  } catch (error) {
    console.error('Error generating boards:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to return a correct answer given 2 player Ids
router.post('/answer', async (req, res) => {
  try {
    const { player1Name, player2Name } = req.body;

    const answer = await getAnswer(player1Name, player2Name);
    res.json({ answer });
  } catch (error) {
    console.error('Error generating boards:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
