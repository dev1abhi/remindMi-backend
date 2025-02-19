const cron = require("node-cron");
const mongoose = require("mongoose");
const Alarm = require("../models/alarm");
const { triggerAlarmCall } = require("../controllers/alarmController");

require("dotenv").config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
}).then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

// Run every minute to check for due alarms
cron.schedule("* * * * *", async () => {
    console.log("Checking for due alarms...");
    
    const now = new Date();

    try {
        const dueAlarms = await Alarm.find({ datetime: { $lte: now }, status: "pending" });

        for (const alarm of dueAlarms) {
            console.log(`Triggering alarm call for ${alarm.phoneNumber} at ${alarm.datetime}`);
            
            await triggerAlarmCall(alarm.phoneNumber);
            alarm.status = "triggered";
            await alarm.save();
        }
    } catch (error) {
        console.error("Error checking alarms:", error);
    }
});
