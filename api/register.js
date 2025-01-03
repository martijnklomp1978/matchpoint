const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('./db'); // Verwijzing naar een databaseconfiguratiebestand, indien nodig

const app = express();
app.use(express.json()); // Middleware om JSON-requests te verwerken

// Route voor registratie
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;

  console.log('Ontvangen gegevens:', req.body); // Log de ontvangen gegevens

  if (!email || !password) {
    console.error('Validatiefout: ontbrekende velden');
    return res.status(400).json({ message: 'Email en wachtwoord zijn verplicht.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Gehashed wachtwoord:', hashedPassword);

    const sql = 'INSERT INTO Users (email, password) VALUES (?, ?)';
    const [result] = await pool.query(sql, [email, hashedPassword]);

    console.log('Gebruiker succesvol toegevoegd:', result.insertId);
    res.status(201).json({ message: 'Gebruiker succesvol geregistreerd!' });
  } catch (err) {
    console.error('Databasefout:', err); // Log de volledige fout
    res.status(500).json({ message: 'Fout bij registratie.', error: err.message });
  }
});

module.exports = app; // Exporteer voor Vercel
