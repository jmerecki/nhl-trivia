const { getDbConnection } = require('../db/db');

// Gets 6 random players from the players table
async function getRandomPlayers() {
  try {
    const connection = await getDbConnection();
    const [allPlayers] = await connection.query('SELECT * FROM players ORDER BY RAND()');

    // Take 6 players 
    const rows = allPlayers.splice(0, 6); 

    const playerData = rows.map((row) => ({
      playerId: row.playerId,
      playerName: row.playerName,
    }));

    let foundMatch = true; // Initialize foundMatch as true

    // Loop though grid and check each box
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        // Get the corresponding top and left player IDs for the current square
        const topPlayerId = playerData[i].playerId;
        const leftPlayerId = playerData[j + 3].playerId;
        let matchFound = false; // Initialize matchFound as false
        while (!matchFound) {
          for (const player of allPlayers) {
            // Check if the player has played with both the corrsponding top or left player
            if (matchFound = await checkGuess(topPlayerId, leftPlayerId, player.playerId)) {

              console.log("Match found = " +matchFound)
              if(matchFound) break;
            }
          }

          if (!matchFound) {
            console.log('No match found for square. Repicking 6 players');
            return getRandomPlayers();
          }
        }

        if (!foundMatch) {
          break;
        }
      }

      if (!foundMatch) {
        break;
      }
    }

    if (foundMatch) {
      console.log('All squares have a match.');
      console.log(rows[0].playerId);
      await connection.query('INSERT INTO valid_boards (player1, player2, player3, player4, player5, player6) VALUES (?, ?, ?, ?, ?, ?)', [
        rows[0].playerId,
        rows[1].playerId,
        rows[2].playerId,
        rows[3].playerId,
        rows[4].playerId,
        rows[5].playerId,
      ]);
      return playerData;
    }
    connection.releaseConnection();

  } catch (error) {
    //await connection.end();

    console.error('Error fetching player data:', error);
    throw error;
  }
}

// Gets all players from players table
async function getAllPlayers() {
  const connection = await getDbConnection();
  const [allPlayers] = await connection.query('SELECT * FROM players ORDER BY playerName');
  connection.releaseConnection();
  return allPlayers;
}

// Checks to see if selectedPlayed has played with both player 1
// and player 2 by comparing teams by season
async function checkGuess(playerId1, playerId2, selectedPlayerId) {
  const connection = await getDbConnection();

  try {
    const [player1Data] = await connection.execute(
      'SELECT * FROM players WHERE playerId = ?',
      [playerId1]
    );

    if (player1Data.length === 0) {
      console.log('Player data not found for player1.');
      return false;
    }

    // Get team history for player 1
    const player1Teams = player1Data[0].playerTeamData;

    const [player2Data] = await connection.execute(
      'SELECT * FROM players WHERE playerId = ?',
      [playerId2]
    );

    if (player2Data.length === 0) {
      console.log('Player data not found for player2.');
      return false;
    }

     // Get team history for player 2
    const player2Teams = player2Data[0].playerTeamData;

    const [player3Data] = await connection.execute(
      'SELECT * FROM players WHERE playerId = ?',
      [selectedPlayerId]
    );

    if (player3Data.length === 0) {
      console.log('Player data not found for player3.');
      return false;
    }

    // Get team history for selected player
    const player3Teams = player3Data[0].playerTeamData;

    // Check if team history matches with player 1
    const hasPlayedWithPlayer1 = player1Teams.some((team1) =>
      player3Teams.some((team3) =>
        team1.team.id === team3.team.id && team1.season === team3.season
      )
    );

    // Check if team history matches with player 2
    const hasPlayedWithPlayer2 = player2Teams.some((team2) =>
      player3Teams.some((team3) =>
        team2.team.id === team3.team.id && team2.season === team3.season
      )
    );

    if (hasPlayedWithPlayer1 && hasPlayedWithPlayer2) {
      console.log(`FOUND MATCH: ${player3Data[0].playerName} `);
      return true;
    } else {
      return false;
    }   
  } catch (error) {
    console.error('Error:', error);
    return false;
  } finally {
    connection.releaseConnection();
  }
}

// Db call to get a random valid board of 6 players
async function getBoard() {
  const connection = await getDbConnection();
  const boardData = await connection.query('SELECT player1, player2, player3, player4, player5, player6 FROM valid_boards order by rand() LIMIT 1');
  const playerIds = Object.values(boardData[0][0]);
  
  const playerDataArray = await Promise.all(playerIds.map(async (playerId) => {
    const playerName = await getPlayerName(playerId);
    return { playerId, playerName };
  }));
  connection.releaseConnection();
  return playerDataArray;
}

// Db call to get player name from player id
async function getPlayerName(playerId) {
  const connection = await getDbConnection();
  const [nameData] = await connection.query('SELECT playerName FROM players WHERE playerId = ?', playerId);
  connection.releaseConnection();
  if (nameData.length > 0) {
    return nameData[0].playerName;
  } else {
    return null; 
  }
}

// Db call to get valid answer
async function getAnswer(player1Name, player2Name) {
  const connection = await getDbConnection();
  
  try {
    const [player1Data] = await connection.execute(
      'SELECT * FROM players WHERE playerName = ?',
      [player1Name]
    );

    if (player1Data.length === 0) {
      console.log('Player data not found for player1.');
      return false;
    }

    // Get team history for player 1
    const player1Teams = player1Data[0].playerTeamData;

    const [player2Data] = await connection.execute(
      'SELECT * FROM players WHERE playerName = ?',
      [player2Name]
    );

    if (player2Data.length === 0) {
      console.log('Player data not found for player2.');
      return false;
    }

    // Get team history for player 2
    const player2Teams = player2Data[0].playerTeamData;

    const [players] = await connection.execute(
      'SELECT * FROM players'    );
    console.log(players);

    for (player of players){
      const player3Teams = player.playerTeamData;

      const hasPlayedWithPlayer1 = player1Teams.some((team1) =>
        player3Teams.some((team3) =>
          team1.team.id === team3.team.id && team1.season === team3.season
        )
      );

      const hasPlayedWithPlayer2 = player2Teams.some((team2) =>
        player3Teams.some((team3) =>
          team2.team.id === team3.team.id && team2.season === team3.season
        )
      );

      if (hasPlayedWithPlayer1 && hasPlayedWithPlayer2) {
        console.log(`FOUND MATCH: ${player.playerName} `);
        return player.playerName;
      }
    }
  } catch (error) {
    console.error('Error:', error);
    return false;
  } finally {
    connection.releaseConnection();
  }
}

module.exports = {
  getRandomPlayers,
  getAllPlayers,
  checkGuess,
  getBoard,
  getAnswer
};
