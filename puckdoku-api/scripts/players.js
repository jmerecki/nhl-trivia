const axios = require('axios');
const mysql = require('mysql2/promise');
const { getDbConnection } = require('../db/db'); // Adjust the path as needed


const API_ENDPOINT = 'https://statsapi.web.nhl.com/api/v1/teams?expand=team.roster';

// Calls the NHL API to get a list of all active players and
// inserts into players table
async function fetchDataAndInsert() {
  try {
    const response = await axios.get(API_ENDPOINT);
    const json = response.data;
    const teams = json.teams;
    const connection = await getDbConnection();

    for (const team of teams) {
        const roster = team.roster.roster;
        for (const player of roster) {
            console.log(player);
            const player_id = player.person.id;
            const player_name = player.person.fullName;        
            await connection.execute('INSERT INTO players (playerId, playerName) VALUES (?, ?)', [player_id, player_name]);

        }
    }

    console.log('Data inserted successfully.');
    connection.releaseConnection();
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the main function
fetchDataAndInsert();
