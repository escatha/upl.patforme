const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const { v4: uuidv4 } = require("uuid");

const userController = require("../controllers/user.controller");

//router.get("/", userController.getAllUsers);

// Connexion à la base SQLite
const db = new sqlite3.Database("./upl_exam_platform.sqlite", (err) => {
  if (err) {
    console.error("Erreur de connexion à SQLite :", err.message);
  } else {
    console.log("✅ Connecté à SQLite depuis user.routes");
  }
});

// Création table users si non existante
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE,
    password TEXT,
    role TEXT,
    faculty TEXT
  )
`);

// Route test
router.get("/users", (req, res) => {
  db.all("SELECT id, name, role, faculty FROM users", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Route Register
router.post("/register", (req, res) => {
  const { name, password, role, faculty } = req.body;
  const id = uuidv4();

  if (!name || !password || !role || !faculty) {
    return res.status(400).json({ error: "Tous les champs sont obligatoires" });
  }

  db.run(
    'INSERT INTO users (id, name, password, role, faculty) VALUES (?, ?, ?, ?, ?)',
    [id, name, password, role, faculty],
    function (err) {
      if (err) {
        if (err.message.includes("UNIQUE")) {
          return res.status(400).json({ error: "Nom d'utilisateur déjà pris" });
        }
        return res.status(500).json({ error: "Erreur lors de l'inscription" });
      }
      res.json({ message: "Utilisateur créé", user: { id, name, role, faculty } });
    }
  );
});

// Route Login
router.post("/login", (req, res) => {
  const { name, password } = req.body;

  if (!name || !password) {
    return res.status(400).json({ error: "Nom et mot de passe requis" });
  }

  db.get(
   ' SELECT id, name, role, faculty FROM users WHERE name = ? AND password = ?',
    [name, password],
    (err, row) => {
      if (err) return res.status(500).json({ error: "Erreur serveur" });
      if (!row) return res.status(401).json({ error: "Identifiants invalides" });

      res.json({ user: row });
    }
  );
});

module.exports = router;