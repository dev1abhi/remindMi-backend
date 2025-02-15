const express = require('express');
const alarmController = require('../controllers/alarmController');

const router = express.Router();

// Route for creating a new alarm
router.post('/createCallAlarm', alarmController.setCallAlarm);