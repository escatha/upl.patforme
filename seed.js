// backend/seed.js
const db = require('./database');

const teacherId = 1; // identifiant d'un enseignant existant
const faculty = 'informatique';

db.serialize(() => {
  console.log("📥 Insertion du questionnaire...");

  db.run(`
    INSERT INTO questionnaires (title, teacherId)
    VALUES (?, ?)
  `, ['QCM Mathématiques', teacherId], function (err) {
    if (err) {
      console.error("❌ Erreur insertion questionnaire :", err.message);
      return;
    }

    const questionnaireId = this.lastID;
    console.log(`✅ Questionnaire inséré avec ID : ${questionnaireId}`);

    console.log("📥 Insertion des questions...");
    const questions = [
      {
        question: "Combien font 5 + 3 ?",
        options: ["6", "7", "8", "9"],
        correct: "8"
      },
      {
        question: "Quelle est la racine carrée de 16 ?",
        options: ["2", "4", "6", "8"],
        correct: "4"
      }
    ];

    const insertQuestion = db.prepare(`
      INSERT INTO questions (questionnaire_id, question_text, options, correct_answer)
      VALUES (?, ?, ?, ?)
    `);

    questions.forEach(q => {
      insertQuestion.run(
        questionnaireId,
        q.question,
        JSON.stringify(q.options),
        q.correct
      );
    });

    insertQuestion.finalize();
    console.log("✅ Questions insérées.");

    console.log("📥 Mise à jour de l'examen avec le questionnaire...");
    db.run(`
      UPDATE exams
      SET questionnaire_id = ?
      WHERE id = 1
    `, [questionnaireId], function (err) {
      if (err) {
        console.error("❌ Erreur mise à jour examen :", err.message);
      } else {
        console.log("✅ Examen mis à jour avec le questionnaire.");
      }
    });
  });
});
