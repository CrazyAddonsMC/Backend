const Release = require('../models/Release');
const {mongo} = require("mongoose");
const {Magic, MAGIC_MIME_TYPE} = require("mmmagic");

const allowedMimeTypes = {
    "bk-plugin": ["application/java-archive"],
    "bc-plugin": ["application/java-archive"],
    "world": ["application/zip"],
    "texturepack": ["application/zip"],
    "config": ["text/plain"]
}

// Gets the mime type of the provided file
const getMimeType = (file) => new Promise((resolve, reject) => new Magic(MAGIC_MIME_TYPE).detect(file, (err, result) => {
    if (err) return reject(err);
    resolve(result);
}));

// Gets a specific release by id
module.exports.getReleaseById = async (id) => {
    if (!mongo.ObjectId.isValid(id)) return null;
    return await Release.findById(id).exec();
}

// Gets a specific release by the addon id & the version of the release
module.exports.getReleaseByAddonId = async (addon_id, release_version) => {
    if (!mongo.ObjectId.isValid(addon_id)) return null;
    return await Release.findOne({addon_id, version: release_version}).exec();
}

// Gets all releases from an addon by id
module.exports.getReleasesByAddonId = async (addon_id) => {
    if (!mongo.ObjectId.isValid(addon_id)) return;
    return await Release.find({addon_id}, {__v: 0}).exec();
}

// Gets the latest release from an addon by id
module.exports.getLatestReleaseByAddonId = async (addon_id) => {
    if (!mongo.ObjectId.isValid(addon_id)) return null;
    return await Release.findOne({addon_id}).sort("-created").exec();
}

// Updates a specific release by id
module.exports.updateReleaseById = async (id, changes) => {
    if (!mongo.ObjectId.isValid(id)) return null;
    return await Release.findByIdAndUpdate(id, changes).exec();
}

// Creates a new release
module.exports.createRelease = async (addon_id, version, mc_versions, description) => {
    if (!mongo.ObjectId.isValid(addon_id)) return null;
    return await Release.create({addon_id, version, mc_versions, description});
}

// Removes all releases from an addon
module.exports.removeAllReleases = async (addon_id) => {
    if (!mongo.ObjectId.isValid(addon_id)) return null;
    return await Release.deleteMany({addon_id}).exec();
}

// Checks if the provided file is in the list of allowed mime types
module.exports.isValidReleaseFile = async (type, file) => {
    let mimeConfig = allowedMimeTypes[type];
    if (mimeConfig === undefined) return false;

    const result = await getMimeType(file.data);

    return mimeConfig.includes(result);
}