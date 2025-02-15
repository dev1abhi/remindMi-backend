const mongoose = require("mongoose");

const alarmSchema = new mongoose.Schema({
    phoneNumber: { type: String, required: true },
    alarmTime: { type: Date, required: true },
    status: { type: String, enum: ["pending", "triggered"], default: "pending" },
});

module.exports = mongoose.model("Alarm", alarmSchema);
