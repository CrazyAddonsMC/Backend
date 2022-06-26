const mongoose = require('mongoose');

const AddonSchema = new mongoose.Schema({
    name: { // The name of the addon
        type: String,
        minLength: 3,
        maxLength: 25,
        required: true
    },
    info: { // A short description about the addon
        type: String,
        minLength: 10,
        maxLength: 50,
        default: "Just another addon"
    },
    description: { // A long description about the addon
        type: String,
        minLength: 100,
        maxLength: 1000,
        default: "This is the long sample description about an addon here on CrazyAddons. Please wait until the developer changes it."
    },
    type: { // The type of the addon
        type: String,
        required: true
    },
    links: Object, // The addon links
    languages: { // All languages supported by the addon
        type: [String],
        default: ["English"]
    },
    created: { // The date when the addon has been added
        type: Date,
        default: Date.now
    },
    downloads: { // The amount of downloads of the addon
        type: Number,
        default: 0
    },
    user_id: { // The id of the author
        type: mongoose.mongo.ObjectId,
        required: true
    },
    price: Number // The price needed to pay for the addon
});

module.exports = mongoose.model('addons', AddonSchema);