const express = require('express');
const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = 3000;

// Database connectie
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('Connected to the database.');
});

app.use(express.json());

// Testroute
app.get('/', (req, res) => {
  res.send('Voetbalapp backend is running!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});