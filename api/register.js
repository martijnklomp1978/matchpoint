const express = require('express');
const bcrypt = require('bcrypt');
const db = require('./db'); // Verwijzing naar een databaseconfiguratiebestand, indien nodig

const app = express();
app.use(express.json()); // Middleware om JSON-requests te verwerken

// Route voor registratie
app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email en wachtwoord zijn verplicht.' });
  }

  try {
    // Wachtwoord hashen
    const hashedPassword = await bcrypt.hash(password, 10);

    // Voeg gebruiker toe aan database
    const sql = 'INSERT INTO Users (email, password) VALUES (?, ?)';
    db.query(sql, [email, hashedPassword], (err, result) => {
      if (err) {
        console.error('Databasefout:', err);
        return res.status(500).json({ message: 'Fout bij registratie.' });
      }
      res.status(201).json({ message: 'Gebruiker succesvol geregistreerd!' });
    });
  } catch (err) {
    console.error('Serverfout:', err);
    res.status(500).json({ message: 'Serverfout.' });
  }
});

module.exports = app; // Exporteer voor Vercel
