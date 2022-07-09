const app = require('express').Router();
const {validateSchema} = require('../util/validate');
const {create, search, updateAddon, links} = require('../validations/addon');
const {
    createAddon,
    addonExists,
    getAddonByName,
    listAddonsByAuthorName,
    searchAddon,
    getAddonById
} = require("../controller/addon");
const {isAuthenticatedUser} = require('../middlewares/authenticate');
const {removeAllReleases} = require('../controller/release');

// Gets a list of all addons by an author
app.get("/:authorName/list", async (req, res) => {
    const addons = await listAddonsByAuthorName(req.params.authorName);
    if (addons === null) return res.status(404).json({message: "The provided author does not exist"});

    res.json(addons);
});

// Gets a specific addon by the author and addon name
app.get("/:authorName/:addonName", async (req, res) => {
    const addon = await getAddonByName(req.params.authorName, req.params.addonName);
    if (addon === null) return res.status(404).json({message: "The provided addon does not exist"});

    res.json(addon);
});

// Searches for one or more addons
app.get("/search", async (req, res) => {
    const validation = await validateSchema(search, req.query);
    if (validation) return res.status(400).json({message: validation});

    res.json(await searchAddon(req.query.query, req.query.limit || 25));
});

// Gets the addon object by id
app.get("/:addonId", async (req, res) => {
    const addon = await getAddonById(req.params.addonId);
    if (addon === null) return res.status(404).json({message: "The provided addon does not exist"});

    res.json(addon);
});

// Creates a new addon
app.put("/", isAuthenticatedUser, async (req, res) => {
    const validation = await validateSchema(create, req.body);
    if (validation) return res.status(400).json({message: validation});


    if (await addonExists(req.user._id, req.body.name)) return res.status(409).json({message: "You already have an addon with this name"});

    try {
        res.status(201).json({
            message: "Successfully created the addon",
            id: (await createAddon({...req.body, user_id: req.user._id}))._id
        });
    } catch (e) {
        res.status(500).json({message: "An internal error occurred"});
    }
});

// Updates details about an addon by id
app.patch("/:addonId", isAuthenticatedUser, async (req, res) => {
    const validation = await validateSchema(updateAddon, req.body);
    if (validation) return res.status(400).json({message: validation});

    const addon = await getAddonById(req.params.addonId);
    if (addon === null) return res.status(404).json({message: "The provided addon does not exist"});

    if (!req.user._id.equals(addon.user_id)) return res.status(404).json({message: "The provided addon does not exist"});

    const updatedAddon = await addon.updateOne(req.body);
    if (!updatedAddon) return res.status(500).json({message: "An internal error occurred"});

    res.json({message: "Your changes were successfully applied"});
});

// Updates the links of an addon by id
app.patch("/:addonId/links", isAuthenticatedUser, async (req, res) => {
    const validation = await validateSchema(links.min(1), req.body);
    if (validation) return res.status(400).json({message: validation});

    const addon = await getAddonById(req.params.addonId);
    if (addon === null) return res.status(404).json({message: "The provided addon does not exist"});

    if (!req.user._id.equals(addon.user_id)) return res.status(404).json({message: "The provided addon does not exist"});

    let updatedBody = {};
    for (let link in req.body)
        updatedBody["links." + link] = req.body[link];

    const updatedAddon = await addon.updateOne({$set: updatedBody});
    if (!updatedAddon) return res.status(500).json({message: "An internal error occurred"});

    res.json({message: "Your changes were successfully applied"});
});

// Deletes an addon by id
app.delete("/:addonId", isAuthenticatedUser, async (req, res) => {
    const addon = await getAddonById(req.params.addonId);
    if (addon === null) return res.status(404).json({message: "The provided addon does not exist"});

    if (!req.user._id.equals(addon.user_id)) return res.status(404).json({message: "The provided addon does not exist"});

    await addon.delete();
    await removeAllReleases(req.params.addonId);

    res.json({message: "The addon has been successfully deleted"});
});

module.exports = app;