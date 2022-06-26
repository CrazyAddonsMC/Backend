const Joi = require('joi');

// The validation used when linking a new server
module.exports.valLinkServer = Joi.object({
    name: Joi.string()
        .min(3).max(10)
        .required()
});

// The validation used when installing a plugin
module.exports.installAddon = Joi.object({
    author: Joi.string()
        .required(),
    addon: Joi.string()
        .required()
});

// The validation used when uninstalling a plugin
module.exports.uninstallAddon = Joi.object({
    author: Joi.string()
        .required(),
    addon: Joi.string()
        .required(),
    keepFiles: Joi.bool()
        .required()
});

// The validation used when the server replies with the current installation status
module.exports.statusResponse = Joi.object({
    status: Joi.bool()
        .required()
});