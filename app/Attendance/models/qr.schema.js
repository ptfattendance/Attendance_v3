const mongoose = require('mongoose');

const qrSchema = new mongoose.Schema(
    {
        qrString: {
            type: String,
            required: true,
            unique: true,
        },
    }, 
);

const Qr = mongoose.model('Qr', qrSchema);

module.exports = Qr;
