const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { // The name of the user
        type: String,
        required: true,
        unique: true,
        minLength: 5,
        maxLength: 15
    },
    email: { // The email of the user
        type: String,
        required: true
    },
    password: { // The password of the user
        type: String,
        required: true
    },
    rank: { // The rank of the user
        type: String,
        default: "user"
    },
    info: { // Some information about the user
        type: String,
        default: "No information provided"
    },
    socials: Object, // The socials of the user (ex. twitter, github, ..)
    joined: { // The date when the user has joined the platform
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('users', UserSchema);