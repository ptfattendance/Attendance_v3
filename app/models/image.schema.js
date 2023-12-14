const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
    email: String,
    data: String // Base64 encoded image data
});

const Image = mongoose.model('Image', imageSchema);
module.exports=Image