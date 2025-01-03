const express = require('express');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const app = express();

dotenv.config();
app.use(express.json());

const port = 3000;

// Database connectie via pool
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

module.exports = pool;

// Testroute
app.get('/', (req, res) => {
  res.send('Voetbalapp backend is running!');
});

// POST /api/register
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email en wachtwoord zijn verplicht.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // SQL-query om gegevens in de database in te voegen
    const sql = 'INSERT INTO Users (email, password) VALUES (?, ?)';
    const [result] = await pool.query(sql, [email, hashedPassword]);

    console.log('Gebruiker succesvol toegevoegd:', result.insertId);
    res.status(201).json({ message: 'Gebruiker succesvol geregistreerd!' });
  } catch (err) {
    console.error('Databasefout:', err);
    res.status(500).json({ message: 'Fout bij registratie.' });
  }
});

// POST /api/login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email en wachtwoord zijn verplicht.' });
  }

  try {
    const sql = 'SELECT * FROM Users WHERE email = ?';
    const [results] = await pool.query(sql, [email]);

    if (results.length === 0) {
      return res.status(401).json({ message: 'Email niet gevonden.' });
    }

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ message: 'Wachtwoord is onjuist.' });
    }

    res.status(200).json({ message: 'Login succesvol!', email: user.email });
  } catch (err) {
    console.error('Databasefout:', err);
    res.status(500).json({ message: 'Serverfout.' });
  }
});

// GET /api/matches
app.get('/api/matches', async (req, res) => {
  try {
    const sql = 'SELECT id, team, opponent, start_time FROM Matches ORDER BY start_time';
    const [results] = await pool.query(sql);

    res.status(200).json(results);
  } catch (err) {
    console.error('Databasefout:', err);
    res.status(500).json({ message: 'Fout bij het ophalen van wedstrijden.' });
  }
});

// POST /api/predictions
app.post('/api/predictions', async (req, res) => {
  const { user_id, match_id, predicted_half_time, predicted_full_time } = req.body;

  if (!user_id || !match_id || !predicted_half_time || !predicted_full_time) {
    return res.status(400).json({ message: 'Alle velden zijn verplicht.' });
  }

  try {
    const sql = `
      INSERT INTO Predictions (user_id, match_id, predicted_half_time, predicted_full_time)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await pool.query(sql, [user_id, match_id, predicted_half_time, predicted_full_time]);

    res.status(201).json({ message: 'Voorspelling succesvol ingevoerd!' });
  } catch (err) {
    console.error('Databasefout:', err);
    res.status(500).json({ message: 'Fout bij het invoeren van de voorspelling.' });
  }
});

// GET /api/leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    const sql = `
      SELECT u.email, SUM(p.points) as total_points
      FROM Predictions p
      JOIN Users u ON p.user_id = u.id
      GROUP BY u.id
      ORDER BY total_points DESC
    `;
    const [results] = await pool.query(sql);

    res.status(200).json(results);
  } catch (err) {
    console.error('Databasefout:', err);
    res.status(500).json({ message: 'Fout bij het ophalen van de standen.' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
