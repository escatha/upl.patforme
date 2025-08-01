const express = require('express');
const router = express.Router();
const db = require('../database');
const examController = require('../controllers/exam.controller');
const questionnaireController = require('../controllers/questionnaire.controller');

// ✅ Route pour récupérer les examens par faculté
router.get('/', (req, res) => {
  const faculty = req.query.faculty;

  if (!faculty) {
    return res.status(400).json({ error: "Paramètre 'faculty' manquant" });
  }

  const sql = `SELECT * FROM exams WHERE faculty = ?`;
  db.all(sql, [faculty], (err, rows) => {
    if (err) {
      console.error("Erreur récupération exams:", err.message);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    res.json(rows);
  });
});

// ✅ Route pour récupérer les examens programmés
router.get('/scheduled', questionnaireController.getScheduledExams);

// ✅ Route pour programmer un examen
router.post('/', (req, res) => {
  const { title, subject, duration, startTime, endTime, faculty } = req.body;

  if (!title || !subject || duration == null || !startTime || !endTime || !faculty) {
    return res.status(400).json({ error: 'Champs manquants' });
  }

  const sql = `
    INSERT INTO exams (title, subject, duration, startTime, endTime, faculty, isScheduled)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  db.run(sql, [title, subject, duration, startTime, endTime, faculty, 1], function(err) {
    if (err) {
      console.error('Erreur insertion exam:', err.message);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    res.status(201).json({ message: 'Examen programmé', examId: this.lastID });
  });
});

module.exports = router;
