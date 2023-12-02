const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
    name: String,
    email: String,
    data: String // Base64 encoded image data
});

const Image = mongoose.model('Image', imageSchema);
module.exports=Image