
//
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

// ✅ Configuration CORS
const allowedOrigins = [
  'http://localhost:3000',
  'https://upl-patforme-frontend.onrender.com'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.options('*', cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/questionnaires", questionnaireRoutes);
app.use("/api/questionnaires", scheduledRoutes);
app.use("/api/results", resultsRoutes);
app.use("/api/users", usersRoutes);
app.use('/api/exams', examRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
