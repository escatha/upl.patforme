const express = require('express');
const router = express.Router();

const examController = require('../controllers/exam.controller');

// GET /api/exams?faculty=xxxx
router.get('/', examController.getScheduledExams);

// POST /api/exams
router.post('/', examController.scheduleExam);

// POST /api/exams/submit-exam
router.post('/submit-exam', examController.submitExam);

module.exports = router;
