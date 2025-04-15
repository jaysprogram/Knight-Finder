// set up the server with handle request
const express = require('express');

// allows chrome extension to make requests to server without getting blocked
const cors = require('cors');

// load mysql2 library
const { createPool } = require('mysql2');

const app = express();
const port = 3000; // listen to port 3000

app.use(cors());
app.use(express.json()); // allows app to understand json data

// MySQL setup
const pool = createPool({
  host: "localhost",
  user: "root",
  password: "Turkey37!",
  database: "knight_finder_database",
  connectionLimit: 10
});

// look in searches table and grab results
//app.get('/searches', (req, res) => {
  //pool.query('SELECT * FROM searches', (err, results) => {
    //if (err) {
      //console.error('Error executing query:', err);
      //return res.status(500).json({ error: 'Database error' }); 
    //}
    //res.json(results);
  //});
//});

// listens for incoming requests
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

app.post("/searches", (req, res) => {
  const { search_term } = req.body;
  pool.query(
    "INSERT INTO searches (search_term) VALUES (?)",
    [search_term],
    (err, result) => {
      if (err) return res.status(500).send("DB error");
      res.json({ success: true, insertedId: result.insertId });
    }
  );
});
