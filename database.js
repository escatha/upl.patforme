// backend/database.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./upl_platforme.db');

db.serialize(() => {
  // USERS
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      matricule TEXT UNIQUE,
      password TEXT,
      role TEXT,
      faculty TEXT
    )
  `, (err) => {
    if (err) console.error("❌ Erreur création table users :", err.message);
    else console.log("✅ Table 'users' créée ou déjà existante.");
  });

  // QUESTIONNAIRES
  db.run(`
    CREATE TABLE IF NOT EXISTS questionnaires (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      subject TEXT,
      duration INTEGER,
      faculty TEXT,
      teacherId INTEGER,
      teacherName TEXT,
      status TEXT,
      submittedAt TEXT,
      startTime TEXT,
      endTime TEXT
    )
  `, (err) => {
    if (err) console.error("❌ Erreur création table questionnaires :", err.message);
    else console.log("✅ Table 'questionnaires' créée ou déjà existante.");
  });

  // EXAMS DROP TABLE IF EXISTS exams; 

db.run(` 
  CREATE TABLE IF NOT EXISTS exams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    isScheduled TEXT NOT NULL,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    duration INTEGER NOT NULL,
    startTime TEXT NOT NULL,
    endTime TEXT NOT NULL,
    faculty TEXT NOT NULL,
    questionnaire_id INTEGER,
    questions TEXT,
    teacherId INTEGER,
    status TEXT DEFAULT 'active', 
       -- <== Ajout ici
    FOREIGN KEY (questionnaire_id) REFERENCES questionnaires(id) ON DELETE CASCADE
  )
`, (err) => {
  if (err) console.error("❌ Erreur création table exams :", err.message);
  else console.log("✅ Table 'exams' créée ou déjà existante.");
});
db.run(`ALTER TABLE exams ADD COLUMN status TEXT DEFAULT 'active'`, (err) => {
  if (err) {
    if (err.message.includes("duplicate column name")) {
      console.log("⚠️ La colonne 'status' existe déjà.");
    } else {
      console.error("❌ Erreur ajout colonne 'status' :", err.message);
    }
  } else {
    console.log("✅ Colonne 'status' ajoutée à la table 'exams'.");
  }
});

  // QUESTIONS
  //DROP TABLE IF EXISTS questions;
   db.run(`
      CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
     questionnaire_id INTEGER,
 
      options TEXT NOT NULL,
      correct_answer INTEGER NOT NULL,
    duration INTEGER, -- ✅ ajout de cette colonne
    faculty TEXT,
    teacherId INTEGER,
    teacherName TEXT,
    status TEXT DEFAULT 'draft',
     question_text TEXT NOT NULL,
    submittedAt TEXT
    
)
  `, (err) => {
    if (err) console.error("❌ Erreur création table questions :", err.message);
    else console.log("✅ Table 'questions' CREE ou déjà existante.");
  });

  // RESULTS
// RESULTS
db.run(`
  CREATE TABLE IF NOT EXISTS results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    exam_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    studentName TEXT NOT NULL,
    totalQuestions INTEGER NOT NULL,
    answers TEXT NOT NULL,
    score REAL ,
    submitted_at TEXT,
    submittedAt TEXT,
    faculty TEXT ,
    FOREIGN KEY (exam_id) REFERENCES exams(id),
    FOREIGN KEY (student_id) REFERENCES users(id)
  )
`, (err) => {
  if (err) console.error("❌ Erreur création table results :", err.message);
  else console.log("✅ Table 'results' créée ou déjà existante.");
});

const path = require('path');
console.log("📁 Chemin DB utilisé :", path.resolve('./upl_platforme.db'));


});

module.exports = db;