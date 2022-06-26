const Joi = require('joi');

// The validation used when creating a new session
module.exports.create = Joi.object({
    username: Joi.string()
        .alphanum()
        .min(5)
        .max(15)
        .required(),
    password: Joi.string()
        .required()
});