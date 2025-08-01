const express = require("express");
const router = express.Router();
const db = require('../database');

// ➕ Ajouter un résultat d'examen (POST)
router.post("/", (req, res) => {
  const { examId, studentId, studentName, score, totalQuestions, submittedAt, faculty } = req.body;

  db.run(
    `INSERT INTO results (examId, studentId, studentName, score, totalQuestions, submittedAt, faculty)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [examId, studentId, studentName, score, totalQuestions, submittedAt, faculty],
    function (err) {
      if (err) {
        console.error("Erreur d'ajout :", err.message);
        return res.status(500).json({ error: "Erreur serveur" });
      }
      res.status(201).json({ message: "Résultat enregistré", id: this.lastID });
    }
  );
});

// 🔍 Obtenir tous les résultats ou par faculté
router.get("/", (req, res) => {
  const { faculty } = req.query;

  if (faculty) {
    db.all(
      "SELECT * FROM results WHERE faculty = ?",
      [faculty],
      (err, rows) => {
        if (err) {
          console.error("Erreur de lecture :", err.message);
          return res.status(500).json({ error: "Erreur serveur" });
        }
        res.json(rows);
      }
    );
  } else {
    db.all("SELECT * FROM results", [], (err, rows) => {
      if (err) {
        console.error("Erreur de lecture :", err.message);
        return res.status(500).json({ error: "Erreur serveur" });
      }
      res.json(rows);
    });
  }
});

module.exports = router;
