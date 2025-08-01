const express = require('express');
const router = express.Router();
const db = require('../database'); // Connexion à ta base SQLite

// ✅ Route pour récupérer les examens + leurs questions pour une faculté
router.get('/', (req, res) => {
  const faculty = req.query.faculty;

  if (!faculty) {
    return res.status(400).json({ error: "Paramètre 'faculty' manquant" });
  }

  const now = new Date().toISOString();

  // Étape 1 : récupérer les examens programmés et en cours
  const examQuery = `
    SELECT * FROM exams
    WHERE faculty = ? AND isScheduled = 1 AND startTime <= ? AND endTime >= ?
  `;

  db.all(examQuery, [faculty, now, now], (err, exams) => {
    if (err) {
      console.error("Erreur récupération examens :", err.message);
      return res.status(500).json({ error: "Erreur lors de la récupération des examens" });
    }

    if (!exams.length) {
      return res.json([]); // Aucun examen
    }

    // Étape 2 : récupérer toutes les questions liées aux examens trouvés
    const examIds = exams.map(e => e.id);
    const placeholders = examIds.map(() => '?').join(',');

    const questionQuery = `
      SELECT * FROM questions
      WHERE exam_id IN (${placeholders})
    `;

    db.all(questionQuery, examIds, (err, questions) => {
      if (err) {
        console.error("Erreur récupération questions :", err.message);
        return res.status(500).json({ error: "Erreur lors de la récupération des questions" });
      }

      // Associer les questions à leur examen
      const examsWithQuestions = exams.map(exam => ({
        ...exam,
        questions: questions
          .filter(q => q.exam_id === exam.id)
          .map(q => ({
            id: q.id,
            question: q.question,
            options: JSON.parse(q.options),
            correctAnswer: q.correctAnswer
          }))
      }));

      res.json(examsWithQuestions);
    });
  });
});
// controllers/user.controller.js



module.exports = router;