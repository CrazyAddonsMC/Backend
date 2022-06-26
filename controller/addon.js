const Addon = require('../models/Addon');
const {getUserByName} = require("./user");
const {mongo} = require("mongoose");

// Gets an addon by id
module.exports.getAddonById = async (id) => {
    if (!mongo.ObjectId.isValid(id)) return null;

    return await Addon.findById(id).exec();
}

// Gets an addon by the user id and addon name
module.exports.getAddonFromUser = async (user_id, addon_name) => {
    return await Addon.findOne({user_id, name: addon_name}).exec();
}

// Updates an addon by id
module.exports.updateAddonById = async (addon_id, changes) => {
    return await Addon.findByIdAndUpdate(addon_id, changes).exec();
}

// Creates an addon with specific options
module.exports.createAddon = async (options) => {
    return Addon.create(options);
}

// Lists all addons by an author
module.exports.listAddonsByAuthorName = async (author_name) => {
    const user = await getUserByName(author_name);
    if (user === null) return;

    return await Addon.find({user_id: user._id}, {__v: 0}).exec();
}

// Gets an addon by the author and addon name
module.exports.getAddonByName = async (author_name, addon_name) => {
    const user = await getUserByName(author_name);
    if (user === null) return;

    return await Addon.findOne({user_id: user._id, name: {$regex: addon_name, $options: 'i'}}, {__v: 0}).exec();
}

// Searches the database for multiple addons by a query
module.exports.searchAddon = async (query, limit = 25) => {
    let options = {$regex: ".*" + query + ".*", $options: "i"};
    return await Addon.find({$or: [{name: options}, {info: options}, {description: options}]}, '', {limit}).exec();
}

// Checks if the provided addon already exists (by the id of the author & the name of the addon)
module.exports.addonExists = async (author_id, addon_name) => {
    if (!mongo.ObjectId.isValid(author_id)) return;

    return await Addon.findOne({user_id: author_id, name: {$regex: addon_name, $options: 'i'}}).exec() !== null;
}