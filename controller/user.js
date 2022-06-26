const bcrypt = require("bcrypt");
const {mongo} = require("mongoose");
const User = require('../models/User');

// Gets a user by id
module.exports.getUserById = async (id) => {
    if (!mongo.ObjectId.isValid(id)) return;
    return await User.findById(id).exec();
}

// Gets a user by name
module.exports.getUserByName = async (username) => {
    return await User.findOne({username: {$regex: username, $options: 'i'}}).exec();
}

// Creates a new user account
module.exports.createAccount = async (username, email, password) => {
    const hash = await bcrypt.hash(password, 10);
    return await User.create({username, email, password: hash});
}

// Updates a user account by id
module.exports.updateAccount = async (user_id, changes) => {
    if (!mongo.ObjectId.isValid(user_id)) return;
    if (changes.password) changes.password = await bcrypt.hash(changes.password, 10);
    return await User.findByIdAndUpdate(user_id, changes).exec();
}

// Updates the user socials by id
module.exports.updateUserSocials = async (user_id, socials) => {
    let updatedSocials = {};
    for (let social in socials)
        updatedSocials["socials."+social] = socials[social];

    if (!mongo.ObjectId.isValid(user_id)) return;
    return await User.findByIdAndUpdate(user_id, {$set: updatedSocials}).exec();
}