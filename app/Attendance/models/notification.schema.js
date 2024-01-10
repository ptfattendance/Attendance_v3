const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
    email: String,
    token: String,
},
{ 
    timestamps: { currentTime: () => new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }) },
    toJSON: {
        transform: function (doc, ret) {
            ret.createdAt = new Date(ret.createdAt).toISOString();
            ret.updatedAt = new Date(ret.updatedAt).toISOString();
            return ret;
        }
    }
    
}

);

const Notification = mongoose.model("notification", notificationSchema);

module.exports = Notification;
