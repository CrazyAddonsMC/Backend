const app = require('express').Router();
const semver = require('semver');
const fs = require('fs');
const fileUpload = require('express-fileupload');
const {isAuthenticatedUser} = require('../middlewares/authenticate');
const {getAddonById} = require('../controller/addon');
const {validateSchema} = require('../util/validate');
const {addRelease} = require('../validations/release');
const {
    createRelease,
    getLatestReleaseByAddonId,
    getReleaseById, isValidReleaseFile, getReleasesByAddonId, getReleaseByAddonId
} = require('../controller/release');

// Sets the file size limit
const releaseUpload = fileUpload({limits: {fileSize: 20000000}, abortOnLimit: true});

// Gets all releases from an addon by id
app.get("/:addonId/list", async (req, res) => {
    const releases = await getReleasesByAddonId(req.params.addonId);
    if (!releases) return res.status(404).json({message: "The provided addon could not be found"});

    res.json(releases);
});

// Gets the latest release from an addon by id
app.get("/:addonId/latest", async (req, res) => {
    const release = await getLatestReleaseByAddonId(req.params.addonId);
    if (!release) return res.status(404).json({message: "The provided addon could not be found"});

    res.json(release);
});

// Gets a release by version and addon id
app.get("/:addonId/:version", async (req, res) => {
    const release = await getReleaseByAddonId(req.params.addonId, req.params.version);
    if (!release) return res.status(404).json({message: "The provided release could not be found"});

    res.json(release);
});

// Creates a new release of an addon
app.put("/:addonId", isAuthenticatedUser, async (req, res) => {
    const validation = await validateSchema(addRelease, req.body);
    if (validation) return res.status(400).json({message: validation});

    const addon = await getAddonById(req.params.addonId);
    if (addon === null) return res.status(404).json({message: "The provided addon does not exist"});

    if (!req.user._id.equals(addon.user_id)) return res.status(404).json({message: "The provided addon does not exist"});

    const release = await getReleaseByAddonId(req.params.addonId, req.body.version);
    if (release) return res.status(409).json({message: "The provided release already exists"});

    const latestRelease = await getLatestReleaseByAddonId(req.params.addonId);
    if (latestRelease !== null && semver.gt(latestRelease.version, req.body.version))
        return res.status(409).json({message: "You cannot create releases with a lower version than the previous one"});

    const createdRelease = await createRelease(req.params.addonId, req.body.version, req.body.mc_versions, req.body.description);
    if (!createdRelease) return res.status(500).json({message: "An internal error occurred"});

    res.json({message: "The release has been created", id: createdRelease._id});
});

// Uploads the file of an addon by id
app.post("/:id/upload", isAuthenticatedUser, releaseUpload, async (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0 || !req.files.upload) return res.status(400).json({message: "No file has been provided"});
    let file = req.files.upload;

    const release = await getReleaseById(req.params.id);
    if (release === null) return res.status(404).json({message: "The provided release does not exist"});

    const addon = await getAddonById(release.addon_id);
    if (addon === null) return res.status(404).json({message: "The provided release does not exist"});

    if (!req.user._id.equals(addon.user_id)) return res.status(404).json({message: "The provided release does not exist"});

    if (!await isValidReleaseFile(addon.type, file)) return res.status(415).json({message: "The provided file format is not supported"});

    await file.mv(process.env.RELEASE_PATH + "/" + release._id, (err) => {
        if (err) return res.status(500).json({message: "The file could no be processed, please try again later"});

        res.json({message: "The file has been uploaded successfully"});
    });
});

// Deletes a release of an addon by id
app.delete("/:id", isAuthenticatedUser, async (req, res) => {
    const release = await getReleaseById(req.params.id);
    if (release === null) return res.status(409).json({message: "The provided release does not exist"});

    const addon = await getAddonById(release.addon_id);
    if (addon === null) return res.status(404).json({message: "The provided release does not exist"});

    if (!req.user._id.equals(addon.user_id)) return res.status(404).json({message: "The provided release does not exist"});

    await release.delete();
    fs.unlink(process.env.RELEASE_PATH + "/" + release._id, () => res.json({message: "Successfully deleted the release"}));
});

module.exports = app;