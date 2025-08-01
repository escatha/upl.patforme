// Import des modules nécessaires
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../database');

const router = express.Router();
const SECRET_KEY = 'ton_secret_key'; // Clé secrète pour signer le token JWT

// Fonctions pour rendre SQLite compatible avec async/await
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
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

/**
 * ROUTE : POST /api/auth/register
 * Permet d'enregistrer un nouvel utilisateur
 */
router.post('/register', async (req, res) => {
  try {
    const { name, matricule, password, role, faculty } = req.body;

    // Vérification que tous les champs soient présents
    if (!name || !matricule || !password || !role || !faculty) {
      return res.status(400).json({ message: 'Tous les champs sont requis.' });
    }

    // Vérifier si le matricule existe déjà
    const existingUser = await dbGet('SELECT * FROM users WHERE matricule = ?', [matricule]);
    if (existingUser) {
      return res.status(400).json({ message: 'Matricule déjà utilisé.' });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Enregistrer l'utilisateur dans la base de données
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

/**
 * ROUTE : POST /api/auth/login
 * Permet à un utilisateur de se connecter et obtenir un token JWT
 */
router.post('/login', async (req, res) => {
  try {
    const { matricule, password } = req.body;

    if (!matricule || !password) {
      return res.status(400).json({ message: 'Matricule et mot de passe requis.' });
    }

    // Cherche l'utilisateur par matricule
    const user = await dbGet('SELECT * FROM users WHERE matricule = ?', [matricule]);
    if (!user) {
      return res.status(400).json({ message: 'Matricule ou mot de passe incorrect.' });
    }

    // Comparer le mot de passe avec le hash stocké
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Matricule ou mot de passe incorrect.' });
    }

    // Générer un token JWT
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
