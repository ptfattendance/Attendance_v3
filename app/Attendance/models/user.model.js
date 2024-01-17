const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
            unique: true,
        },
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            match: /^\S+@\S+\.\S+$/,
        },
        password: {
            type: String,
            required: true,
            minlength: 8,
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },
        address: {
            type: String,
            required: true,
        },
        phoneNumber: {
            type: String,
            required: true,
        },
        batch: {
            type: String,
            required: true,
        },
        designation: {
            type: String,
            required: true,
        },
    },
    { 
        timestamps: { currentTime: () => new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }) },
        toJSON: {
            transform: function (doc, ret) {
                ret.createdAt = new Date(ret.createdAt).toISOString("en-US", { timeZone: "Asia/Kolkata" });
                ret.updatedAt = new Date(ret.updatedAt).toISOString("en-US", { timeZone: "Asia/Kolkata" });
                return ret;
            }
        }
        
    }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
