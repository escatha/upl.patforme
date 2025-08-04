// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
require('./database'); // Assurez-vous que ce fichier configure et exporte votre connexion BDD

// Importation des routes
const authRoutes = require('./routes/auth.routes');
const questionnaireRoutes = require('./routes/questionnaires.routes');
const scheduledRoutes = require('./routes/scheduled.routes'); // Routes pour /scheduled
const resultsRoutes = require('./routes/results.routes');
const usersRoutes = require('./routes/users.routes');
//const examRoutes = require('./routes/exam.routes');



const examRoutes = require('./routes/exams');




const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Routes API
app.use("/api/auth", authRoutes);

// On regroupe les questionnaires et la sous-route /scheduled
app.use("/api/questionnaires", questionnaireRoutes);
app.use("/api/questionnaires", scheduledRoutes);

app.use("/api/results", resultsRoutes);
app.use("/api/users", usersRoutes);
app.use('/api/exams', examRoutes);

// Route de test
app.get("/", (req, res) => {
  res.send("API is running...");
});
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});


// Lancement du serveur
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
