const {getServerByToken} = require("../controller/link");

// Authenticates the server by a token
module.exports.authenticateServer = async (client, data) => {
    if (!data.token) return;

    const server = await getServerByToken(data.token);
    if (!server) {
        client.send(JSON.stringify({code: 2, message: "Authentication failed"}));
        return;
    }

    if (!server.linked)
        await server.updateOne({linked: true}).exec();

    if (!server.online)
        await server.updateOne({online: true}).exec();

    return server;
}