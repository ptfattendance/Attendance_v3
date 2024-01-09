const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
    email: String,
    otp: String,
    createdAt: { type: Date, default: Date.now }
});

const Otp = mongoose.model("otp", otpSchema);

module.exports = Otp;
