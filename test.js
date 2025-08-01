const db = require('./database');

const insertExam = `
  INSERT INTO exams (
    isScheduled, title, subject, duration, startTime, endTime, faculty, questionnaire_id, teacherId
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

const now = new Date();
const startTime = new Date(now.getTime() - 10 * 60000).toISOString(); // 10 min avant maintenant
const endTime = new Date(now.getTime() + 50 * 60000).toISOString();   // 50 min après maintenant

db.run(
  insertExam,
  ["1", "Examen Test", "Mathématiques", 60, startTime, endTime, "informatique", null, 1],
  function (err) {
    if (err) return console.error("❌ Erreur insertion :", err.message);
    console.log("✅ Examen inséré avec ID :", this.lastID);
  }
);
