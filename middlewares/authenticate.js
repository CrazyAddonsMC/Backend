const Token = require('../models/Token');
const Link = require('../models/Link');
const User = require('../models/User');

const tokenTypes = ["Bearer", "API", "Server"];
const roleTrack = ["admin", "moderator", "user"];

// Checks the token
module.exports.checkToken = async (req, res) => {
    // Get token header
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(400).json({message: "You need to provide the 'authorization' header"});

    // Validate token header
    const splitHeader = authHeader.split(" ");
    if (splitHeader.length !== 2) return res.status(400).json({message: "You need to provide the token and the type of the token in the 'authorization' header"});
    if (!tokenTypes.includes(splitHeader[0])) return res.status(400).json({message: "You need to provide a valid token type in the 'authorization' header"});

    // Validate token in database [Session & API Tokens]
    if (splitHeader[0] === "Bearer" || splitHeader[0] === "API") {
        const token = await Token.findOne({token: splitHeader[1]}).exec();
        if (token === null) return res.status(401).json({message: "The provided token is wrong"});

        if (splitHeader[0] === "Bearer" && token.type === "api") return res.status(400).json({message: "You cannot provide session tokens for api requests"});
        if (splitHeader[0] === "API" && token.type === "session") return res.status(400).json({message: "You cannot provide api tokens for session requests"});

        return {type: splitHeader[0], user_id: token.user_id.toString(), token: token.token}
    }

    // Validate token in database [Server links]
    if (splitHeader[0] === "Server") {
        const link = await Link.findOne({token: splitHeader[1]}).exec();
        if (link === null) return res.status(401).json({message: "The provided token is wrong or not a server link"});
        if (!link.linked) return res.status(401).json({message: "The provided server is not linked yet"});

        return {type: splitHeader[0], user_id: link.user_id.toString(), token: link.token}
    }
}

// Checks if the server is authenticated
module.exports.isAuthenticatedServer = async (req, res, next) => {
    const token = await this.checkToken(req, res);
    if (!token.token) return;
    if (token.type !== "Server") return res.status(403).json({message: "You are accessing a server route with an api/user token"});

    req.user = await User.findById(token.user_id).exec();
    if (req.user === null) return res.status(500).json({message: "An internal error occurred"});

    next();
}

// Checks if the user is authenticated
module.exports.isAuthenticatedUser = async (req, res, next) => {
    const token = await this.checkToken(req, res);
    if (!token.token) return;
    if (token.type === "Server") return res.status(403).json({message: "You are accessing a non-server route with a server token"});

    req.user = await User.findById(token.user_id).exec();
    if (req.user === null) return res.status(500).json({message: "An internal error occurred"});

    next();
}

// Checks if the user has an exact role
module.exports.hasRoleExact = (role) => (req, res, next) => this.isAuthenticatedUser(req, res, () => {
    if (req.user.rank !== role) return res.status(403).json({message: "You don't have access for this"});

    next();
});

module.exports.roles = roleTrack;