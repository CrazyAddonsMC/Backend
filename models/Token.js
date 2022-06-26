const mongoose = require('mongoose');
const crypto = require('crypto');

const TokenSchema = new mongoose.Schema({
    token: { // The token used to log in to the user account
        type: String,
        default: () => crypto.randomBytes(48).toString('hex')
    },
    user_id: { // The user id to which the token logs in
        type: mongoose.Schema.ObjectId,
        required: true
    },
    type: { // The type of the token
        type: String,
        enum: ["api", "session"],
        default: "session"
    },
    user_agent: { // The user agent of the browser
        type: String,
        required: false
    },
    created: { // The date when the session has been created
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('tokens', TokenSchema);