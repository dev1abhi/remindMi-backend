const cron = require("node-cron");
const mongoose = require("mongoose");
const Alarm = require("../models/alarm");
const { triggerAlarmCall , triggerEmail , triggerMessage  } = require("../controllers/alarmController");

require("dotenv").config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
}).then(() => console.log("Connected to MongoDB from scheduler"))
  .catch(err => console.error("MongoDB connection error:", err));

// Run every minute to check for due alarms
cron.schedule("* * * * *", async () => {
    console.log("Checking for due alarms...");
    
    const now = new Date();


    try {
        const dueAlarms = await Alarm.find({ datetime: { $lte: now }, status: "pending" });

        for (const alarm of dueAlarms) {
            const { phone, email } = alarm.contactInfo;
            const { call, sms, whatsapp, email: emailNotif } = alarm.notifications || {};
            const title = alarm.title || "Reminder";
            const datetime = alarm.datetime || new Date();

            console.log(`Triggering notifications for ${phone || email} at ${alarm.datetime}`);

            // Call
            if (call && phone) {
                await triggerAlarmCall(phone);
                console.log(`Call triggered for ${phone}`);
            }

            // SMS / WhatsApp
            if ((sms || whatsapp) && phone) {
                await triggerMessage(phone, title);
                console.log(`Message triggered for ${phone}: ${title}`);
            }

            // Email
            if (emailNotif && email) {
                await triggerEmail(email, title , datetime);
                console.log(`Email triggered for ${email}: ${title}`);
            }

            alarm.status = "triggered";
            await alarm.save();
        }
    } catch (error) {
        console.error("Error checking alarms:", error);
    }
});
