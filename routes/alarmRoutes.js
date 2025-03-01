const express = require('express');
const alarmController = require('../controllers/alarmController');
const authMiddleware = require("../middleware/auth"); // Ensure authentication


const router = express.Router();

// Route for creating a new alarm
router.post('/createCallAlarm',authMiddleware, alarmController.setCallAlarm);

router.get("/getalarms", authMiddleware, alarmController.getAlarmsByUser);


module.exports = router;