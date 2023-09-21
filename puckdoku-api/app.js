const express = require('express');
const app = express();
const cors = require('cors'); // Import the cors package

app.use(cors())

// Middleware
app.use(express.json()); // Parse JSON requests
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded requests

// Routes
const playersController = require('./controllers/playersController');
const usersController = require('./controllers/usersController')
const leaderboardController = require('./controllers/leaderboardController')

app.use('/players', playersController); 
app.use('/users', usersController);
app.use('/leaderboards', leaderboardController);

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
