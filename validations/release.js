const {semver} = require('joi-extension-semver');
const Joi = require('joi').extend(semver);

// The validation used when adding a new release
module.exports.addRelease = Joi.object({
    version: Joi.semver()
        .valid()
        .required(),
    mc_versions: Joi.array()
        .items(Joi.string().min(2).max(10)),
    description: Joi.string()
});