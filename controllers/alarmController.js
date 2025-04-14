
const mongoose = require("mongoose");
const twilio = require("twilio");
const Alarm = require("../models/alarm");
const notificationapi = require('notificationapi-node-server-sdk').default;

require("dotenv").config();


const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const flowId = process.env.TWILIO_FLOW_ID;
const fromNumber = process.env.TWILIO_FROM_NUMBER;

const client = twilio(accountSid, authToken);

notificationapi.init(
    process.env.NOTIFICATIONAPI_CLIENT_ID,
    process.env.NOTIFICATIONAPI_CLIENT_SECRET
  )

// Set Call Alarm
// const setCallAlarm = async (req, res) => {
//     try {
//         const { title, datetime, notifications, contactInfo } = req.body;
//         const userID = req.user.user.id; // Extracted from authentication middleware
//         console.log("User id from token:", userID);
        

//         if (!contactInfo?.phone || !datetime) {
//             return res.status(400).json({ error: "Phone number and alarm time are required" });
//         }

//         const alarm = new Alarm({
//             userID,// Auto-filled from token
//             title: title || "Untitled Alarm",
//             datetime,
//             notifications: notifications || {
//                 email: false,
//                 whatsapp: false,
//                 sms: false,
//                 call: false,
//             },
//             contactInfo: {
//                 email: contactInfo?.email || "",
//                 phone: contactInfo.phone,
//             },
//             status: "pending",
//         });

//         await alarm.save();
//         res.status(201).json({ message: "Alarm set successfully", alarm });
//     } catch (error) {
//         console.error("Error setting alarm:", error);
//         res.status(500).json({ error: "Failed to set alarm", details: error.message });
//     }
// };


const createCallAlarm = async (req, res) => {
    try {
        const { title, datetime, notifications = {}, contactInfo } = req.body;
        const userID = req.user.user.id; // Extracted from authentication middleware
        console.log("User id from token:", userID);

        if (!contactInfo?.phone || !datetime) {
            return res.status(400).json({ error: "Phone number and alarm time are required" });
        }

        // Filter to only include turned-on notifications
        const enabledNotifications = {};
        Object.entries(notifications).forEach(([key, value]) => {
            if (value === true) {
                enabledNotifications[key] = true;
            }
        });

        console.log("Enabled notifications:", enabledNotifications);

        const alarm = new Alarm({
            userID,
            title: title || "Untitled Alarm",
            datetime,
            notifications: enabledNotifications,
            contactInfo: {
                email: contactInfo?.email || "",
                phone: contactInfo.phone,
            },
            status: "pending",
        });

        await alarm.save();
        res.status(201).json({ message: "Alarm set successfully", alarm });
    } catch (error) {
        console.error("Error setting alarm:", error);
        res.status(500).json({ error: "Failed to set alarm", details: error.message });
    }
};



//trigger Message
const triggerMessage = async (phone, title) => {
    try {
      await notificationapi.send({
        notificationId: 'remindmi_sms_alarm',
        user: {
          id: phone, // Unique ID to reference this user
          number: phone,
        },
        mergeTags: {
          title: title,
          type: 'SMS Reminder'
        },
      });
      console.log(`SMS/WhatsApp notification sent to ${phone}`);
    } catch (error) {
      console.error(`Error sending message to ${phone}:`, error.message);
    }
  };



//Trigger email
const triggerEmail = async (email, title, datetime) => {
    try {
      await notificationapi.send({
        notificationId: 'remindmi_email_alarm', // Match your NotificationAPI template ID
        user: {
          id: email,
          email,
        },
        mergeTags: {
          title,
          datetime,
        }
      });
  
      console.log(`Email sent to ${email} for alarm: ${title}`);
    } catch (error) {
      console.error("Error sending email notification:", error.message);
    }
  };





// Trigger Alarm Call
const triggerAlarmCall = async (phoneNumber) => {
    try {
        const call = await client.calls.create({
            from: fromNumber,
            to: phoneNumber,
            twiml: "<Response><Say>This is your scheduled alarm reminder. Please take action.</Say></Response>",
        });

        console.log("Alarm call triggered:", call.sid);
        return call;
    } catch (error) {
        console.error("Error triggering alarm call:", error.message);
        throw error;
    }
};

// Get Alarms By User
const getAlarmsByUser = async (req, res) => {
    try {
        const userID = req.user.user.id; // Extract email from authenticated user
        const alarms = await Alarm.find({ userID });

        res.status(200).json({ alarms });
    } catch (error) {
        console.error("Error fetching alarms:", error);
        res.status(500).json({ message: "Failed to fetch alarms" });
    }
};


const deleteAlarm = async (req, res) => {
    const alarmId = req.params.id;
  
    try {
      const deletedAlarm = await Alarm.findByIdAndDelete(alarmId);
  
      if (!deletedAlarm) {
        return res.status(404).json({ message: "Alarm not found" });
      }
  
      res.status(200).json({ message: "Alarm deleted successfully", deletedAlarm });
    } catch (error) {
      console.error("Error deleting alarm:", error);
      res.status(500).json({ message: "Server error" });
    }
  };



module.exports = { createCallAlarm, triggerAlarmCall, getAlarmsByUser , triggerMessage , triggerEmail , deleteAlarm };
