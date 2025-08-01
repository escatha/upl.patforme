// backend/routes/scheduled.routes.js
const express = require('express');
const router = express.Router();
const db = require('../database'); // ton database.js à la racine

// GET /api/questionnaires/scheduled?faculty=...
router.get('/scheduled', (req, res) => {
  const faculty = req.query.faculty;
  if (!faculty) {
    return res.status(400).json({ error: "Paramètre 'faculty' manquant" });
  }

  const now = new Date().toISOString();

  // Étape 1 : on récupère d'abord les examens planifiés (isScheduled = 1) pour la fac.
  const examSql = `
    SELECT 
      e.id   AS examId,
      e.questionnaire_id AS questionnaireId,
      e.startTime,
      e.endTime
    FROM exams e
    WHERE e.faculty = ?
      AND e.isScheduled = 1
      AND e.startTime <= ?
      AND e.endTime >= ?
  `;

  db.all(examSql, [faculty, now, now], (err, exams) => {
    if (err) {
      console.error("❌ Erreur récupération exams :", err.message);
      return res.status(500).json({ error: "Erreur interne" });
    }
    if (!exams.length) {
      return res.json([]);  // Aucun exam en cours
    }

    // On va maintenant charger les données des questionnaires liés
    // et les questions associées.
    const questionnaireIds = exams.map(e => e.questionnaireId);
    const placeholdersQ = questionnaireIds.map(() => '?').join(',');
    const questionnaireSql = `
      SELECT
        q.id,
        q.title,
        q.subject,
        q.duration,
        q.faculty,
        q.teacherId,
        q.teacherName
      FROM questionnaires q
      WHERE q.id IN (${placeholdersQ})
    `;

    db.all(questionnaireSql, questionnaireIds, (err, questionnaires) => {
      if (err) {
        console.error("❌ Erreur récupération questionnaires :", err.message);
        return res.status(500).json({ error: "Erreur interne" });
      }

      // Puis on récupère toutes les questions pour ces questionnaires
      const questionSql = `
        SELECT 
          qs.id,
          qs.question_text AS question,
          qs.options,
          qs.correct_answer AS correctAnswer,
          qs.questionnaire_id AS questionnaireId
        FROM questions qs
        WHERE qs.questionnaire_id IN (${placeholdersQ})
      `;

      db.all(questionSql, questionnaireIds, (err, questions) => {
        if (err) {
          console.error("❌ Erreur récupération questions :", err.message);
          return res.status(500).json({ error: "Erreur interne" });
        }

        // On assemble la réponse
        const result = exams.map(exam => {
          // trouver le questionnaire associé
          const qnr = questionnaires.find(q => q.id === exam.questionnaireId);
          if (!qnr) return null;

          // filtrer ses questions
          const qs = questions
            .filter(q => q.questionnaireId === qnr.id)
            .map(q => ({
              id: q.id,
              question: q.question,
              options: JSON.parse(q.options),
              correctAnswer: Number(q.correctAnswer),
            }));

          return {
            examId: exam.examId,
            questionnaireId: qnr.id,
            title: qnr.title,
            subject: qnr.subject,
            duration: qnr.duration,
            teacherId: qnr.teacherId,
            teacherName: qnr.teacherName,
            startTime: exam.startTime,
            endTime: exam.endTime,
            questions: qs
          };
        }).filter(x => x !== null);

        res.json(result);
      });
    });
  });
});

module.exports = router;
