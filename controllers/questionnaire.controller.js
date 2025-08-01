const db = require('../database');

// ✅ Soumettre un questionnaire
exports.submitQuestionnaire = (req, res) => {
  const { title, subject, duration, questions, faculty, teacherId, teacherName } = req.body;

  if (
    !title ||
    !subject ||
    typeof duration !== 'number' ||
    !Array.isArray(questions) ||
    !faculty ||
    !teacherId ||
    !teacherName
  ) {
    return res.status(400).json({ error: 'Champs requis manquants' });
  }

  const submittedAt = new Date().toISOString();
  db.run(
    `INSERT INTO questionnaires
       (title, subject, duration, faculty, teacherId, teacherName, status, submittedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [title, subject, duration, faculty, teacherId, teacherName, 'submitted', submittedAt],
    function (err) {
      if (err) {
        console.error('❌ submitQuestionnaire BDD error:', err.message);
        return res.status(500).json({ error: 'Erreur d’enregistrement du questionnaire' });
      }

      const questionnaireId = this.lastID;

      const stmt = db.prepare(
        `INSERT INTO questions
           (questionnaire_id, question_text, options, correct_answer)
         VALUES (?, ?, ?, ?)`
      );
      questions.forEach(({ question_text, options, correct_answer }) => {
        stmt.run(
          questionnaireId,
          question_text,
          JSON.stringify(options),
          correct_answer
        );
      });
      stmt.finalize(err => {
        if (err) console.error('❌ finalize questions error:', err.message);
        res.status(201).json({
          message: 'Questionnaire soumis avec succès',
          questionnaireId
        });
      });
    }
  );
};

// ✅ Récupérer les questionnaires soumis
exports.getSubmittedQuestionnaires = (req, res) => {
  db.all(`SELECT * FROM questionnaires WHERE status = 'submitted'`, [], (err, rows) => {
    if (err) {
      console.error("erreur sql :", err);
      return res.status(500).json({ error: 'Erreur de récupération des questionnaires' });
    }
    res.json(rows);
  });
};

// ✅ Approuver un questionnaire
exports.approveQuestionnaire = (req, res) => {
  const id = req.params.id;
  db.run(`UPDATE questionnaires SET status = 'approved' WHERE id = ?`, [id], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors de l’approbation' });
    }

    db.get(`SELECT * FROM questionnaires WHERE id = ?`, [id], (err, questionnaire) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur récupération du questionnaire approuvé' });
      }
      res.json({ message: 'Questionnaire approuvé', questionnaire });
    });
  });
};


// ✅ Rejeter un questionnaire
exports.rejectQuestionnaire = (req, res) => {
  const id = req.params.id;
  db.run(`UPDATE questionnaires SET status = 'rejected' WHERE id = ?`, [id], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors du rejet' });
    }
    res.json({ message: 'Questionnaire rejeté' });
  });
};

// ✅ Programmer un examen
exports.scheduleExam = (req, res) => {
  const { title, subject, duration, startTime, endTime, faculty, teacherId, questionnaire_id, questions } = req.body;

  const serializedQuestions = JSON.stringify(questions || []);

  db.run(
    `INSERT INTO exams (title, subject, duration, startTime, endTime, faculty, teacherId, questionnaire_id, questions, isScheduled)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [title, subject, duration, startTime, endTime, faculty, teacherId, questionnaire_id, serializedQuestions, 1],
    function (err) {
      if (err) {
        console.error("Erreur insertion exam:", err.message);
        return res.status(500).json({ error: 'Erreur de programmation de l’examen' });
      }
      res.status(201).json({ message: 'Examen programmé' });
    }
  );
};


// ✅ Récupérer les examens programmés par faculté
exports.getScheduledExams = (req, res) => {
  const faculty = req.query.faculty;

  if (!faculty) {
    return res.status(400).json({ message: 'Le paramètre faculté est requis' });
  }

  db.all(
    `SELECT exams.*, questionnaires.title, questionnaires.subject, questionnaires.duration
     FROM exams
     JOIN questionnaires ON exams.questionnaire_id = questionnaires.id
     WHERE exams.isScheduled = '1' AND exams.faculty = ?`,
    [faculty],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur de récupération des examens programmés' });
      }
      res.json(rows);
    }
  );
};


// ✅ Récupérer les questionnaires par faculté
exports.getByFaculty = (req, res) => {
  const faculty = req.params.faculty;

  db.all(
    `SELECT * FROM questionnaires WHERE faculty = ?`,
    [faculty],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur de récupération des questionnaires par faculté' });
      }
      res.json(rows);
    }
  );
};
exports.getQuestionsByQuestionnaire = (req, res) => {
  const questionnaireId = req.params.id;
  db.all(
    `SELECT * FROM questions WHERE questionnaire_id = ?`,
    [questionnaireId],
    (err, rows) => {
      if (err) {
        console.error("Erreur récupération questions :", err.message);
        return res.status(500).json({ error: 'Erreur récupération des questions' });
      }
      res.json(rows);
    }
  );
};


// ✅ Récupérer les questionnaires programmés par faculté
exports.getScheduledQuestionnaires = (req, res) => {
  const faculty = req.query.faculty;

  if (!faculty) {
    return res.status(400).json({ message: 'Le paramètre faculté est requis' });
  }

  db.all(
    `SELECT * FROM questionnaires WHERE status = 'approved' AND faculty = ?`,
    [faculty],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur lors de la récupération des questionnaires programmés' });
      }
      res.json(rows);
    }
  );
};
