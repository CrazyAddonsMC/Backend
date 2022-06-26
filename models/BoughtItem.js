const mongoose = require('mongoose');

const BoughtItemSchema = new mongoose.Schema({
    user_id: { // The id of the user that bought the addon
        type: mongoose.mongo.ObjectId,
        required: true
    },
    addon_id: { // The id of the addon the user bought
        type: mongoose.mongo.ObjectId,
        required: true
    }
});

module.exports = mongoose.model('bought_items', BoughtItemSchema);