const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
//const db = require('../db');
const SECRET_KEY = 'ton_secret_key';
const db = require('../database');



// Promisify manuellement les méthodes SQLite avec callbacks
function dbGet(sql, params) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function dbRun(sql, params) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

// Inscription
router.post('/register', async (req, res) => {
  try {
    const { name, matricule, password, role, faculty } = req.body;

    if (!name || !matricule || !password || !role || !faculty) {
      return res.status(400).json({ message: 'Tous les champs sont requis.' });
    }

    const existingUser = await dbGet('SELECT * FROM users WHERE matricule = ?', [matricule]);
    if (existingUser) {
      return res.status(400).json({ message: 'Matricule déjà utilisé.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await dbRun(
      'INSERT INTO users (name, matricule, password, role, faculty) VALUES (?, ?, ?, ?, ?)',
      [name, matricule, hashedPassword, role, faculty]
    );

    res.status(201).json({ message: 'Utilisateur créé avec succès.' });
  } catch (error) {
    console.error('Erreur inscription:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});


// Connexion
router.post("/login", async (req, res) => {
  try {
    const { matricule, password } = req.body;

    if (!matricule || !password) {
      return res.status(400).json({ message: 'Matricule et mot de passe requis.' });
    }

    const user = await dbGet('SELECT * FROM users WHERE matricule = ?', [matricule]);

    if (!user) {
      return res.status(400).json({ message: 'Matricule ou mot de passe incorrect.' });
    }console.log("utilisateur trouver :",user);
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Matricule ou mot de passe incorrect.' });
    }

    const token = jwt.sign(
      { id: user.id, matricule: user.matricule, role: user.role, faculty: user.faculty },
      SECRET_KEY,
      { expiresIn: '12h' }
    );

    res.json({
      message: 'Connexion réussie',
      token,
      user: {
        id: user.id,
        name: user.name,
        matricule: user.matricule,
        role: user.role,
        faculty: user.faculty,
      },
    });
  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

module.exports = router;
