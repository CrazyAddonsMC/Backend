const express = require('express');
const fs = require('fs');

const {checkToken} = require('../middlewares/authenticate');
const {getUserByName, getUserById} = require("../controller/user");
const {getAddonFromUser, updateAddonById} = require("../controller/addon");
const {getReleaseByAddonId, getLatestReleaseByAddonId, updateReleaseById} = require("../controller/release");
const {ownsItem} = require("../controller/boughtItem");

// Create a new express app
const app = express();
let dl_folder;

// Register routes
app.get('/:author/:addon/:version.(addon|zip|jar)', async (req, res) => {
    // Get author
    const author = await getUserByName(req.params.author);
    if (author === null) return res.status(404).json({code: 1, message: "The provided addon does not exist"});

    // Get addon
    const addon = await getAddonFromUser(author._id, req.params.addon);
    if (addon === null) return res.status(404).json({code: 1, message: "The provided addon does not exist"});

    // Get release
    const release = req.params.version === "latest" ? await getLatestReleaseByAddonId(addon._id)
        : await getReleaseByAddonId(addon._id, req.params.version);
    if (release === null) return res.status(404).json({
        code: 2, message: req.params.version === "latest"
            ? "Currently, there are no releases for this addon" : "The provided release version does not exist"
    });

    // Check price
    if (addon.price !== undefined && addon.price !== 0) {
        const token = await checkToken(req, res);
        if (!token.token) return;

        const user = await getUserById(token.user_id);
        if (user === null) return res.status(500).json({code: 4, message: "An internal error occurred"});

        if (!await ownsItem(user._id, addon._id)) return res.status(402).json({
            code: 3,
            message: "You don't own this addon"
        });
    }

    let addonPath = dl_folder + "/" + release._id;
    if (!fs.existsSync(addonPath)) return res.status(404).json({
        code: 5,
        message: "The author didn't upload the release file yet"
    });

    // Update download stats
    await updateAddonById(addon._id, {$inc: {downloads: 1}});
    await updateReleaseById(release._id, {$inc: {downloads: 1}});

    try {
        res.sendFile(addonPath);
    } catch (e) {
        res.status(500).json({message: "The file could not be delivered"});
    }
});

// Register 404 route
app.use("*", (req, res) => {
    res.status(400).json({message: "You need to use the correct url schema"});
});


// Start the express server
module.exports.startServer = (port = 8355, release_folder = "/mnt/data/download") => {
    dl_folder = release_folder;
    app.listen(port, () => log(`Listening to port ${port}`));
}

// Stop the express server
module.exports.stopServer = () => {
    app.close();
    console.log("Closed the server");
}

// Log something in the express server
const log = (msg) => {
    console.log(`[Download] ${msg}`);
}

module.exports.server = app;