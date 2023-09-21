const mysql = require('mysql2');

const dbConfigDev = {
  host: 'puckdoku-mysql.mysql.database.azure.com',
  user: 'puckdoku',
  password: 'Vn)q\\M39&7?m',
  database: 'puckdoku-db',
};

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'puckdoku_merecki',
  };
// Create a connection pool
const pool = mysql.createPool(dbConfigDev);

// Export a function to get a connection from the pool
function getDbConnection() {
  return pool.promise();
}

module.exports = {
  getDbConnection,
};
