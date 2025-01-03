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

const bcrypt = require('bcrypt');

// Registratie route
app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email en wachtwoord zijn verplicht.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = 'INSERT INTO Users (email, password) VALUES (?, ?)';
    db.query(sql, [email, hashedPassword], (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Fout bij registratie.', error: err });
      }
      res.status(201).json({ message: 'Gebruiker succesvol geregistreerd!' });
    });
  } catch (err) {
    res.status(500).json({ message: 'Serverfout.', error: err });
  }
});

const bcrypt = require('bcrypt');

// Login route
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email en wachtwoord zijn verplicht.' });
  }

  const sql = 'SELECT * FROM Users WHERE email = ?';
  db.query(sql, [email], async (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Serverfout.', error: err });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'Email niet gevonden.' });
    }

    const user = results[0];

    // Vergelijk het ingevoerde wachtwoord met het gehashte wachtwoord
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Wachtwoord is onjuist.' });
    }

    // Login succesvol
    res.status(200).json({ message: 'Login succesvol!', email: user.email });
  });
});

// Route om wedstrijden op te halen
app.get('/matches', (req, res) => {
  const sql = 'SELECT id, team, opponent, start_time FROM Matches ORDER BY start_time';
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Fout bij het ophalen van wedstrijden.', error: err });
    }
    res.status(200).json(results);
  });
});

// Route om een voorspelling in te voeren
app.post('/predictions', (req, res) => {
  const { user_id, match_id, predicted_half_time, predicted_full_time } = req.body;

  if (!user_id || !match_id || !predicted_half_time || !predicted_full_time) {
    return res.status(400).json({ message: 'Alle velden zijn verplicht.' });
  }

  const sql = `
    INSERT INTO Predictions (user_id, match_id, predicted_half_time, predicted_full_time)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [user_id, match_id, predicted_half_time, predicted_full_time], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Fout bij het invoeren van de voorspelling.', error: err });
    }
    res.status(201).json({ message: 'Voorspelling succesvol ingevoerd!' });
  });
});

// Route om standen te tonen
app.get('/leaderboard', (req, res) => {
  const sql = `
    SELECT u.email, SUM(p.points) as total_points
    FROM Predictions p
    JOIN Users u ON p.user_id = u.id
    GROUP BY u.id
    ORDER BY total_points DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Fout bij het ophalen van de standen.', error: err });
    }
    res.status(200).json(results);
  });
});


