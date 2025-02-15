require("dotenv").config();
const mongoose = require("mongoose");
const twilio = require("twilio");
const Alarm = require("../models/alarm");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const flowId = process.env.TWILIO_FLOW_ID;
const fromNumber = process.env.TWILIO_FROM_NUMBER;

const client = twilio(accountSid, authToken);

// Set Alarm , setCallAlarm takes phoneNumber and alarmTime
const setCallAlarm = async (req, res) => {
    const { phoneNumber, alarmTime } = req.body;

    if (!phoneNumber || !alarmTime) {
        return res.status(400).json({ error: "Phone number and alarm time are required" });
    }

    try {
        const alarm = new Alarm({ phoneNumber, alarmTime, status: "pending" });
        await alarm.save();

        res.status(201).json({ message: "Alarm set successfully", alarm });
    } catch (error) {
        res.status(500).json({ error: "Failed to set alarm", details: error.message });
    }
};

// Trigger Alarm Call
const triggerAlarmCall = async (phoneNumber) => {
    try {
        const execution = await client.studio.v2.flows(flowId)
            .executions.create({ to: phoneNumber, from: fromNumber });

        console.log("Alarm call triggered:", execution.sid);
        return execution;
    } catch (error) {
        console.error("Error triggering alarm call:", error.message);
        throw error;
    }
};

module.exports = { setCallAlarm, triggerAlarmCall };
