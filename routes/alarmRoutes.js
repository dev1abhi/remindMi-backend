const express = require('express');
const alarmController = require('../controllers/alarmController');
const authMiddleware = require("../middleware/auth"); // Ensure authentication


const router = express.Router();

// Route for creating a new alarm
router.post('/createCallAlarm',authMiddleware, alarmController.createCallAlarm);

router.get("/getalarms", authMiddleware, alarmController.getAlarmsByUser);

router.delete("/delete/:id", authMiddleware , alarmController.deleteAlarm);

module.exports = router;