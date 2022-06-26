const {mongo} = require('mongoose');
const BoughtItem = require('../models/BoughtItem');

// Checks if the user owns a specific addon
module.exports.ownsItem = async (user_id, addon_id) => {
    if (!mongo.ObjectId.isValid(user_id)) return;
    if (!mongo.ObjectId.isValid(addon_id)) return;
    return await BoughtItem.findOne({user_id, addon_id}).exec() !== null;
}