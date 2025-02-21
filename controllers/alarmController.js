require("dotenv").config();
const mongoose = require("mongoose");
const twilio = require("twilio");
const Alarm = require("../models/alarm");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const flowId = process.env.TWILIO_FLOW_ID;
const fromNumber = process.env.TWILIO_FROM_NUMBER;

const client = twilio(accountSid, authToken);

// Set Call Alarm
const setCallAlarm = async (req, res) => {
    try {
        const { title, datetime, notifications, contactInfo } = req.body;
        const userID = req.user.user.id; // Extracted from authentication middleware
        console.log("User id from token:", userID);
        

        if (!contactInfo?.phone || !datetime) {
            return res.status(400).json({ error: "Phone number and alarm time are required" });
        }

        const alarm = new Alarm({
            userID,// Auto-filled from token
            title: title || "Untitled Alarm",
            datetime,
            notifications: notifications || {
                email: false,
                whatsapp: false,
                sms: false,
                call: false,
            },
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

module.exports = { setCallAlarm, triggerAlarmCall, getAlarmsByUser };
