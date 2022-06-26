const app = require('express').Router();
const {validateSchema} = require('../util/validate');
const {isAuthenticatedUser} = require('../middlewares/authenticate');
const {valLinkServer, installAddon, statusResponse, uninstallAddon} = require('../validations/server');
const {linkServer, getServer, regenToken, listServer} = require('../controller/link');
const {broadcastToServer, closeServerConnectionById, getInformationFromServer} = require('../server/socket');
const {getAddonByName} = require('../controller/addon');

// Validates the server by the express request
const validateServer = async (req, res, mustBeOnline = false) => {
    const server = await getServer(req.params.serverId);
    if (!server) return res.status(404).json({message: "The provided server does not exist"});
    if (!server.user_id.equals(req.user._id)) return res.status(404).json({message: "The provided server does not exist"});
    if (mustBeOnline && !server.online) return res.status(504).json({message: "The provided server is not online"});
    return server;
}

// Links & creates a new server
app.post("/link", isAuthenticatedUser, async (req, res) => {
    const validation = await validateSchema(valLinkServer, req.body);
    if (validation) return res.status(400).json({message: validation});

    const token = await linkServer(req.user._id, req.body.name);
    if (!token) return res.status(500).json({message: "An internal error occurred"});

    res.status(201).json({message: "Successfully created the server", token});
});

// Unlinks & deletes a new server
app.post("/:serverId/unlink", isAuthenticatedUser, async (req, res) => {
    const server = await validateServer(req, res);
    if (!server._id) return;

    await server.delete();
    await closeServerConnectionById(req.params.serverId);
    res.json({message: "Server successfully unlinked"});
});

// Regenerates the token of a server
app.post("/:serverId/regenerate", isAuthenticatedUser, async (req, res) => {
    const server = await validateServer(req, res);
    if (!server._id) return;

    const token = await regenToken(req.params.serverId);
    if (!token) return res.status(404).json({message: "The provided server does not exist"});

    res.json({message: "Successfully regenerated the token", token});
});

// Lists all registered servers by the client
app.get("/list", isAuthenticatedUser, async (req, res) => {
    res.json(await listServer(req.user._id));
});

/*
    The following routes need to communicate with the server directly
*/

// Installs an addon the server
app.post("/:serverId/install", isAuthenticatedUser, async (req, res) => {
    const validation = await validateSchema(installAddon, req.body);
    if (validation) return res.status(400).json({message: validation});

    const addon = await getAddonByName(req.body.author, req.body.addon);
    if (addon === null) return res.status(404).json({message: "The provided addon does not exist"});

    const server = await validateServer(req, res, true);
    if (!server._id) return;

    broadcastToServer(req.params.serverId, 10, req.body);
    res.json({message: "The server now installs the provided addon"});
});

// Checks if a specific addon is installed on the server
app.get("/:serverId/status", isAuthenticatedUser, async (req, res) => {
    const validation = await validateSchema(installAddon, req.body);
    if (validation) return res.status(400).json({message: validation});

    const addon = await getAddonByName(req.body.author, req.body.addon);
    if (addon === null) return res.status(404).json({message: "The provided addon does not exist"});

    const server = await validateServer(req, res, true);
    if (!server._id) return;

    const response = await getInformationFromServer(req.params.serverId, 7, req.body);
    if (await validateSchema(statusResponse, response)) return res.status(500).json({message: "The server sent an incorrect response"});

    res.json({installed: response.status});
});

// Uninstalls an addon from the server
app.post("/:serverId/uninstall", isAuthenticatedUser, async (req, res) => {
    if (!req.body.keepFiles) req.body.keepFiles = true;

    const validation = await validateSchema(uninstallAddon, req.body);
    if (validation) return res.status(400).json({message: validation});

    const addon = await getAddonByName(req.body.author, req.body.addon);
    if (addon === null) return res.status(404).json({message: "The provided addon does not exist"});

    const server = await validateServer(req, res, true);
    if (!server._id) return;

    broadcastToServer(req.params.serverId, 11, req.body);
    res.json({message: "The server now uninstalls the provided addon"});
});

module.exports = app;