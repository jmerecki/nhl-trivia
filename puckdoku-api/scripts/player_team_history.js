const axios = require('axios');
const mysql = require('mysql2/promise');
const { getDbConnection } = require('../db/db'); // Adjust the path as needed


const BASE_API_URL = 'https://statsapi.web.nhl.com/api/v1/people/';
const ENDPOINT_SUFFIX = '/stats?stats=yearByYear';

// Calls the NHL API to insert player stats
async function fetchDataAndInsert() {
  const connection = await getDbConnection();

  try {
    const [rows] = await connection.execute('SELECT playerId FROM players');
    const playerIds = rows.map((row) => row.playerId);

    for (const playerId of playerIds) {
      console.log(`Fetching data for playerId ${playerId}`);

      const response = await axios.get(BASE_API_URL + playerId + ENDPOINT_SUFFIX);
      const data = response.data;
      const splits = data.stats[0].splits;

      if (splits) {
        const filteredSplits = splits.filter((item) => {
          return (
            item.stat.timeOnIce &&
            parseInt(item.stat.timeOnIce.split(":")[0], 10) >= 300 &&
            !item.team.link.includes("/null") &&
            item.team.id < 55
          );
        });

        if (filteredSplits.length > 0) {
          const teamData = filteredSplits.map((item) => ({
            season: item.season,
            team: item.team,
          }));

          await connection.execute(
            'UPDATE players SET playerTeamData = ? WHERE playerId = ?',
            [JSON.stringify(teamData), playerId]
          );

          console.log(`Data inserted successfully for playerId ${playerId}`);
        } else {
          console.log(
            `No data available with over 500 minutes played for playerId ${playerId}`
          );
        }
      } else {
        console.log(`No data available for playerId ${playerId}`);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.releaseConnection();
  }
}

  
  // Run the main function
  fetchDataAndInsert();
  
