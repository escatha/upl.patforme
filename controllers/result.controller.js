const db = require("../database");

exports.getAllResults = (req, res) => {
  db.all("SELECT * FROM results", [], (err, rows) => {
    if (err) return res.status(500).json({ error: "Erreur serveur" });
    res.json(rows.map(row => ({
      ...row,
      answers: JSON.parse(row.answers)
    })));
  });
};
