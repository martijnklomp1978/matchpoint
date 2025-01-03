const express = require('express');
const bcrypt = require('bcrypt');
const { Pool } = require('pg'); // PostgreSQL-module
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Database connectie via Pool
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Middleware om JSON te verwerken
app.use(express.json());

// Testroute
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.status(200).json({ message: 'Database connection successful!', result: result.rows });
  } catch (error) {
    console.error('Database connection failed:', error);
    res.status(500).json({ message: 'Database connection failed', error: error.message });
  }
});

// POST /api/register
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email en wachtwoord zijn verplicht.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = 'INSERT INTO Users (email, password) VALUES ($1, $2) RETURNING id';
    const result = await pool.query(sql, [email, hashedPassword]);

    res.status(201).json({ message: 'Gebruiker succesvol geregistreerd!', userId: result.rows[0].id });
  } catch (err) {
    console.error('Databasefout bij registratie:', err);
    res.status(500).json({ message: 'Fout bij registratie.', error: err.message });
  }
});

// POST /api/login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email en wachtwoord zijn verplicht.' });
  }

  try {
    const sql = 'SELECT * FROM Users WHERE email = $1';
    const result = await pool.query(sql, [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Email niet gevonden.' });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ message: 'Wachtwoord is onjuist.' });
    }

    res.status(200).json({ message: 'Login succesvol!', email: user.email });
  } catch (err) {
    console.error('Databasefout bij inloggen:', err);
    res.status(500).json({ message: 'Serverfout.', error: err.message });
  }
});

// GET /api/matches
app.get('/api/matches', async (req, res) => {
  try {
    const sql = 'SELECT id, team, opponent, start_time FROM Matches ORDER BY start_time';
    const result = await pool.query(sql);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Databasefout bij het ophalen van wedstrijden:', err);
    res.status(500).json({ message: 'Fout bij het ophalen van wedstrijden.', error: err.message });
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
      VALUES ($1, $2, $3, $4)
    `;
    await pool.query(sql, [user_id, match_id, predicted_half_time, predicted_full_time]);

    res.status(201).json({ message: 'Voorspelling succesvol ingevoerd!' });
  } catch (err) {
    console.error('Databasefout bij voorspellingen:', err);
    res.status(500).json({ message: 'Fout bij het invoeren van de voorspelling.', error: err.message });
  }
});

// GET /api/leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    const sql = `
      SELECT u.email, COALESCE(SUM(p.points), 0) as total_points
      FROM Predictions p
      JOIN Users u ON p.user_id = u.id
      GROUP BY u.id
      ORDER BY total_points DESC
    `;
    const result = await pool.query(sql);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Databasefout bij het ophalen van de standen:', err);
    res.status(500).json({ message: 'Fout bij het ophalen van de standen.', error: err.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
