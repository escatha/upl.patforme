require('dotenv').config();
const express = require('express');
const cors = require('cors');
require('./database');

const authRoutes = require('./routes/auth.routes');
const questionnaireRoutes = require('./routes/questionnaires.routes');
const scheduledRoutes = require('./routes/scheduled.routes');
const resultsRoutes = require('./routes/results.routes');
const usersRoutes = require('./routes/users.routes');
const examRoutes = require('./routes/exams');

const app = express();
const PORT = process.env.PORT || 3001;

// ✅ CORS : Origines autorisées
const allowedOrigins = [
  'http://localhost:3000',
  'https://upl-patforme-frontend.onrender.com'
];

// ✅ CORS : Configuration propre
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // pour gérer les requêtes "preflight"

app.use(express.json());

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/questionnaires", questionnaireRoutes);
app.use("/api/questionnaires", scheduledRoutes);
app.use("/api/results", resultsRoutes);
app.use("/api/users", usersRoutes);
app.use('/api/exams', examRoutes);

// ✅ Route test
app.get("/", (req, res) => {
  res.send("API is running...");
});

// ✅ Middleware log
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// ✅ Lancement du serveur
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
