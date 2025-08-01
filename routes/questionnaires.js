const express = require('express');
const router = express.Router();
const questionnaireController = require('../controllers/questionnaire.controller');
const Exam = require("../models/exam.model");
 // à créer


router.get('/', questionnaireController.getAll);
router.get('/submitted', questionnaireController.getSubmitted);
router.post('/submit', questionnaireController.submitQuestionnaire);
router.post('/approve/:id', questionnaireController.approveQuestionnaire);
router.post('/reject/:id', questionnaireController.rejectQuestionnaire);
router.post('/schedule', questionnaireController.scheduleExam);
router.get ('/scheduled', questionnaireController.getScheduledExams);


module.exports = router;
