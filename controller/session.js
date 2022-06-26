const Token = require('../models/Token');
const {mongo} = require("mongoose");
const {getUserByName} = require("./user");
const bcrypt = require("bcrypt");

// Creates a new user session
module.exports.createUserSession = async (user_id, user_agent) => {
    return await Token.create({user_id, user_agent, type: "session"});
}

// Gets all sessions by the user
module.exports.getSessions = async (user_id, type = "session") => {
    return await Token.find({user_id, type}, {token: 0, __v: 0, user_id: 0, type: 0}).exec();
}

// Gets a session by the token
module.exports.getSessionByToken = async (token) => {
    return await Token.findOne({token}).exec();
}

// Gets a session by the id
module.exports.getSessionById = async (id) => {
    if (!mongo.ObjectId.isValid(id)) return;
    return await Token.findById(id).exec();
}

// Checks if the provided session is linked to the user & valid
module.exports.getSessionFromUser = async (currentUserId, sessionId) => {
    if (!mongo.ObjectId.isValid(sessionId)) return;
    const session = await this.getSessionById(sessionId);
    if (session === null) return;
    if (session.type !== "session") return;
    if (!currentUserId.equals(session.user_id)) return;

    return session;
}

// Validates the username and password by a user and creates a new session
module.exports.validateUser = async (username, password, user_agent) => {
    const user = await getUserByName(username);
    if (user === null) return;

    if (!bcrypt.compareSync(password, user.password)) return;

    try {
        return (await this.createUserSession(user._id, user_agent)).token;
    } catch (ignored) {
    }
}