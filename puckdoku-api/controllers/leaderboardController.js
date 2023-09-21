const express = require('express');
const router = express.Router();
const { getUserStats, getTopFiveStats } = require('../services/leaderboardService');

// Returns the top 5 users based on correct guess %
router.get('/topFive', async (req, res) => {
    try {
      const top5Stats = await getTopFiveStats();
      res.json(top5Stats);
    } catch (error) {
      console.error('Error fetching player stats:', error);
      res.status(500).json({ error: 'Error'  });
    }
  });

// Returns the stats for a given user
router.get('/user/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const playerStats = await getUserStats(username);
    res.json(playerStats);
  } catch (error) {
    console.error('Error fetching player stats:', error);
    res.status(500).json({ error: `Cannot get stats for user` });
  }
});

module.exports = router;

