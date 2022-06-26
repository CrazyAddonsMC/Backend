const Joi = require('joi');

const usernameRegex = "^(?:[a-zA-Z\\d]+(?:(?:\\.|-|_)[a-zA-Z\\d])*)+$";

// The validation used when creating a new user
module.exports.createUser = Joi.object({
    username: Joi.string()
        .regex(new RegExp(usernameRegex))
        .min(5)
        .max(15)
        .required(),
    email: Joi.string()
        .email()
        .max(50)
        .required(),
    password: Joi.string()
        .min(8)
        .max(256)
        .required()
});

// The validation used when updating an existing user
module.exports.updateUser = Joi.object({
    username: Joi.string()
        .regex(new RegExp(usernameRegex))
        .min(5)
        .max(15),
    email: Joi.string()
        .email()
        .max(50),
    password: Joi.string()
        .min(8)
        .max(256),
    info: Joi.string()
        .min(10)
        .max(150)
}).min(1);

// The validation used when updating the user socials
module.exports.updateSocials = Joi.object({
    website: Joi.string()
        .max(100)
        .uri(),
    github: Joi.string()
        .max(100)
        .uri(),
    youtube: Joi.string()
        .max(100)
        .uri(),
    twitter: Joi.string()
        .max(100)
        .uri(),
    discord: Joi.string()
        .regex(new RegExp("^.{3,32}#[0-9]{4}$")),
    instagram: Joi.string()
        .max(100)
        .uri()
}).min(1);