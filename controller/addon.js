const Addon = require('../models/Addon');
const {getUserByName} = require("./user");
const {mongo} = require("mongoose");

// Gets an addon by id
module.exports.getAddonById = async (id) => {
    if (!mongo.ObjectId.isValid(id)) return null;

    return await Addon.findById(id).populate('author', 'username email').exec();
}

// Gets an addon by the user id and addon name
module.exports.getAddonFromUser = async (author, addon_name) => {
    return await Addon.findOne({author, name: addon_name}).collation({locale: "en", strength: 2}).populate('author', 'username email').exec();
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

    return await Addon.find({author: user._id}, {__v: 0}).populate('author', 'username email').exec();
}

// Gets an addon by the author and addon name
module.exports.getAddonByName = async (author_name, name) => {
    const user = await getUserByName(author_name);
    if (user === null) return null;

    return await Addon.findOne({author: user._id, name}, {__v: 0}).populate('author', 'username email').collation({locale: "en", strength: 2}).exec();
}

// Searches the database for multiple addons by a query
module.exports.searchAddon = async (query, limit = 25) => {
    let options = {$regex: ".*" + query + ".*", $options: "i"};
    return await Addon.find({$or: [{name: options}, {info: options}, {description: options}]}, '', {limit}).populate('author', 'username email').exec();
}

// Checks if the provided addon already exists (by the id of the author & the name of the addon)
module.exports.addonExists = async (author, name) => {
    if (!mongo.ObjectId.isValid(author)) return;

    return await Addon.findOne({author, name}).collation({locale: "en", strength: 2}).exec() !== null;
}