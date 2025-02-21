// const mongoose = require("mongoose");

// const alarmSchema = new mongoose.Schema({
//     phoneNumber: { type: String, required: true },
//     alarmTime: { type: Date, required: true },
//     status: { type: String, enum: ["pending", "triggered"], default: "pending" },
// });

// module.exports = mongoose.model("Alarm", alarmSchema);


const mongoose = require("mongoose");

const alarmSchema = new mongoose.Schema({
    userID: { type: String, required: true }, // User's email to fetch alarms
    title: { type: String, required: true }, // Alarm title
    datetime: { type: Date, required: true }, // Alarm date & time
    notifications: {
        email: { type: Boolean, default: false },
        whatsapp: { type: Boolean, default: false },
        sms: { type: Boolean, default: false },
        call: { type: Boolean, default: false }
    },
    contactInfo: {
        email: { type: String, default: "" },
        phone: { type: String, required: true }
    },
    status: { type: String, enum: ["pending", "triggered"], default: "pending" }
});

module.exports = mongoose.model("Alarm", alarmSchema);
