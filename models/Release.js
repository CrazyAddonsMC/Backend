const mongoose = require('mongoose');

const ReleaseSchema = new mongoose.Schema({
    addon_id: { // The id of the addon for which this release is intended
        type: mongoose.mongo.ObjectId,
        required: true
    },
    version: { // The version of the release (semver)
        type: String,
        required: true
    },
    mc_versions: { // The allowed minecraft versions
        type: [String],
        default: ["1.19"]
    },
    description: { // The description of the release (ex. what changed)
        type: String,
        default: "The author of this release has not provided a description"
    },
    downloads: { // The number of downloads that the release has reached
        type: Number,
        default: 0
    },
    created: { // The date of when the release has been created
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('releases', ReleaseSchema);