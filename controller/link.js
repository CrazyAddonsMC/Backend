const Link = require('../models/Link');
const {mongo} = require("mongoose");
const crypto = require("crypto");

// Links a new server to a user & returns the generated token
module.exports.linkServer = async (user_id, name) => {
    const server = await Link.create({user_id, name});
    return server.token
}

// Get a server by id
module.exports.getServer = async (server_id) => {
    if (!mongo.ObjectId.isValid(server_id)) return;
    return await Link.findById(server_id).exec();
}

// Get a server by an token
module.exports.getServerByToken = async (token) => {
    return await Link.findOne({token}).exec();
}

// Generates a new token for a specific server & returns it
module.exports.regenToken = async (server_id) => {
    if (!mongo.ObjectId.isValid(server_id)) return;
    const token = crypto.randomBytes(48).toString('hex');
    await Link.findByIdAndUpdate(server_id, {token}).exec();
    return token;
}

// Lists all servers by a specific user
module.exports.listServer = async (user_id) => {
    return await Link.find({user_id}, {token: 0, __v: 0, user_id: 0}).exec();
}

// Sets a specific server online/offline by id
module.exports.setServerOnline = async (server_id, online = true) => {
    if (!mongo.ObjectId.isValid(server_id)) return;
    await Link.findByIdAndUpdate(server_id, {online}).exec();
}