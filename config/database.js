// backend/config/database.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./upl_exam_platform.sqlite', (err) => {
  if (err) {
    console.error("❌ Erreur de connexion :", err.message);
  } else {
    console.log("✅ Connecté à SQLite");
  }
});

// ✅ Création des tables si elles n'existent pas


module.exports = db;