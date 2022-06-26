const mongoose = require('mongoose');

const MediaSchema = new mongoose.Schema({
    file_id: { // The id of the file
        type: mongoose.mongo.ObjectId,
        required: true
    },
    type: { // The type of the file
        type: String,
        enum: ["file", "avatar", "icon"]
    },
    name: { // The name of the file
        type: String,
        default: "unnamed"
    },
    user_id: { // The id of the user that created the file
        type: mongoose.mongo.ObjectId,
        required: true
    }
});

module.exports = mongoose.model('media', MediaSchema);