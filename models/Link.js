const mongoose = require('mongoose');
const crypto = require("crypto");

const LinkSchema = new mongoose.Schema({
    token: { // The token used to log in into the socket
        type: String,
        default: () => crypto.randomBytes(48).toString('hex')
    },
    user_id: { // The id of the user linked to the server
        type: mongoose.Schema.ObjectId,
        required: true
    },
    name: { // The name of the server
        type: String,
        required: true
    },
    linked: { // The status indicating whether the server has been connected at least once
        type: Boolean,
        default: false
    },
    online: { // The status indicating whether the server is currently connected to the socket
        type: Boolean,
        default: false
    },
    added: { // The date when the server has been linked
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('links', LinkSchema);