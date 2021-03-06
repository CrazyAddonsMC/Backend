const bcrypt = require("bcrypt");
const {mongo} = require("mongoose");
const User = require('../models/User');

// Gets a user by id
module.exports.getUserById = async (id) => {
    if (!mongo.ObjectId.isValid(id)) return;
    return await User.findById(id).exec();
}

// Gets a user by name (ignore case)
module.exports.getUserByName = async (username) => {
    return User.findOne({username}).collation({locale: "en", strength: 2});
}

// Gets a user by name or id
module.exports.getUser = async (usernameOrId) => {
    if (!mongo.ObjectId.isValid(usernameOrId)) return await this.getUserByName(usernameOrId);

    return await User.findOne({$or: [{_id: usernameOrId}, {username: usernameOrId}]}).exec();
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
        updatedSocials["socials." + social] = socials[social];

    if (!mongo.ObjectId.isValid(user_id)) return;
    return await User.findByIdAndUpdate(user_id, {$set: updatedSocials}).exec();
}