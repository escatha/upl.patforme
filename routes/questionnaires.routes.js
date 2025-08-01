// backend/routes/questionnaires.routes.js
const express = require('express');
const router = express.Router();
const questionnaireController = require('../controllers/questionnaire.controller');

// Soumettre un questionnaire
router.post('/submit', questionnaireController.submitQuestionnaire);

// Récupérer les questionnaires soumis
router.get('/submitted', questionnaireController.getSubmittedQuestionnaires);

// Approuver un questionnaire
router.post('/approve/:id', questionnaireController.approveQuestionnaire);

// Rejeter un questionnaire
router.post('/reject/:id', questionnaireController.rejectQuestionnaire);

// Programmer un examen
router.post('/schedule', questionnaireController.scheduleExam);

// Récupérer les examens programmés pour une faculté spécifique
router.get('/scheduled', questionnaireController.getScheduledExams);

// ✅ Récupérer les questionnaires par faculté
router.get('/faculty/:faculty', questionnaireController.getByFaculty);
router.get('/:id/questions', questionnaireController.getQuestionsByQuestionnaire);

module.exports = router;
