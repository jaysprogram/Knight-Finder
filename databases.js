const { createPool } = require('mysql2');

const pool = createPool({
  host: "localhost", // lowercase 'h'
  user: "root",
  password: "Turkey37!",
  database: "knight_finder_database",
  connectionLimit: 10 // capital 'L'
});

pool.query(`SELECT * FROM searches`, (err, res) => {
  if (err) {
    return console.error('Error executing query:', err);
  }
  console.log('Results:', res);
});
