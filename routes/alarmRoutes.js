const express = require('express');
const alarmController = require('../controllers/alarmController');
const authMiddleware = require("../middleware/auth"); // Ensure authentication
const { triggerAlarmCall, triggerEmail, triggerMessage } = require('../controllers/alarmController');


const router = express.Router();

router.post('/trigger-alarms', async (req, res) => {
  const now = new Date();

  try {
    const dueAlarms = await Alarm.find({ datetime: { $lte: now }, status: "pending" });

    for (const alarm of dueAlarms) {
      const { phone, email } = alarm.contactInfo;
      const { call, sms, whatsapp, email: emailNotif } = alarm.notifications || {};
      const title = alarm.title || "Reminder";
      const datetime = alarm.datetime || new Date();

      // Trigger notifications
      if (call && phone) await triggerAlarmCall(phone, title);
      if ((sms || whatsapp) && phone) await triggerMessage(phone, title);
      if (emailNotif && email) await triggerEmail(email, title, datetime);

      alarm.status = "triggered";
      await alarm.save();
    }
    res.status(200).json({ message: "Alarms triggered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while triggering alarms" });
  }
});

// Route for creating a new alarm
router.post('/createCallAlarm',authMiddleware, alarmController.createCallAlarm);

router.get("/getalarms", authMiddleware, alarmController.getAlarmsByUser);

router.delete("/delete/:id", authMiddleware , alarmController.deleteAlarm);

module.exports = router;