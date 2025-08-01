// backend/controllers/exam.controller.js
const db = require('../database');

// Récupérer les examens programmés d'une faculté avec leurs questions
const getScheduledExams = (req, res) => {
  const faculty = req.query.faculty;

  if (!faculty) {
    return res.status(400).json({ error: "Paramètre 'faculty' manquant" });
  }

  console.log('🔍 Liste tous les examens programmés pour :', faculty);

  const examQuery = `
    SELECT * FROM exams
    WHERE faculty = ? AND isScheduled = '1'
  `;

  db.all(examQuery, [faculty], (err, exams) => {
    if (err) {
      console.error("❌ Erreur récupération examens :", err.message);
      return res.status(500).json({ error: "Erreur serveur" });
    }

    if (!exams.length) {
      console.log("📋 Aucun examen programmé trouvé");
      return res.json([]); // Aucun examen trouvé
    }

    const questionnaireIds = exams.map(e => e.questionnaire_id).filter(Boolean);
    if (questionnaireIds.length === 0) {
      return res.json(exams.map(e => ({ ...e, questions: [] })));
    }

    const placeholders = questionnaireIds.map(() => '?').join(',');
    const questionQuery = `
      SELECT * FROM questions WHERE questionnaire_id IN (${placeholders})
    `;

    db.all(questionQuery, questionnaireIds, (err, questions) => {
      if (err) {
        console.error("❌ Erreur récupération questions :", err.message);
        return res.status(500).json({ error: "Erreur serveur" });
      }

      const examsWithQuestions = exams.map(exam => ({
        ...exam,
        questions: questions
          .filter(q => q.questionnaire_id === exam.questionnaire_id)
          .map(q => ({
            id: q.id,
            question: q.question_text,
            options: JSON.parse(q.options),
            correctAnswer: q.correct_answer
          }))
      }));

      console.log(`📦 ${examsWithQuestions.length} examen(s) retourné(s)`);
      res.json(examsWithQuestions);
    });
  });
};
// Planifier un nouvel examen
const scheduleExam = async (req, res) => {
  try {
    const {
      title,
      subject,
      duration,
      startTime,
      endTime,
      faculty,
      teacherId,
      questionnaire_id
    } = req.body;

    console.log("📨 Requête planification reçu:", req.body);

    // Validation simple
    if (!title || !questionnaire_id || !startTime || !endTime || !faculty) {
      console.warn("⚠️ Champs manquants dans la planification");
      return res.status(400).json({ error: 'Champs manquants' });
    }

    const stmt = `
      INSERT INTO exams (title, subject, duration, startTime, endTime, faculty, teacherId, questionnaire_id, isScheduled, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, '1', 'active')
    `;

    const result = await new Promise((resolve, reject) => {
      db.run(stmt,
        [title, subject, duration, startTime, endTime, faculty, teacherId, questionnaire_id],
        function (err) {
          if (err) {
            console.error("❌ Erreur insertion examen:", err);
            reject(err);
          } else {
            console.log("✅ Examen inséré avec ID:", this.lastID);
            resolve({ id: this.lastID });
          }
        });
    });

    res.status(201).json({ message: 'Examen programmé', examId: result.id });
  } catch (error) {
    console.error("❌ Erreur lors de la planification :", error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
const submitExam = (req, res) => {
  console.log("📩 Requête submitExam reçue avec body :", req.body);

  const {
    examId,
    answers,
    studentId,
    studentName,
    totalQuestions,
    faculty,
    score
  } = req.body;

  const submittedAt = new Date().toISOString();

  if (
  examId == null ||
  studentId == null ||
  answers == null ||
  studentName == null ||
  totalQuestions == null ||
  faculty == null ||
  score == null
) {
  console.log("❌ Données manquantes :", {
    examId,
    studentId,
    answers,
    studentName,
    totalQuestions,
    faculty,
    score
  });

  return res.status(400).json({
    error: "Informations manquantes pour soumettre l'examen."
  });
}


  const stmt = `
    INSERT INTO results (
      exam_id,
      student_id,
      answers,
      submitted_at,
      studentName,
      totalQuestions,
      faculty,
      score
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(
    stmt,
    [
      examId,
      studentId,
      JSON.stringify(answers),
      submittedAt,
      studentName,
      totalQuestions,
      faculty,
      score
    ],
    function (err) {
      if (err) {
        console.error("❌ Erreur lors de la soumission :", err.message);
        return res
          .status(500)
          .json({ error: "Erreur lors de la soumission de l'examen." });
      }

      res.status(200).json({ message: "Examen soumis avec succès." });
    }
  );
};



module.exports = {

  getScheduledExams,
  scheduleExam,
  submitExam,
};
