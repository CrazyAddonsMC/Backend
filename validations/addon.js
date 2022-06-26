const Joi = require('joi');

// The addon validation used when searching one or multiple addons by a query
module.exports.search = Joi.object({
    query: Joi.string()
        .min(3)
        .max(100)
        .required(),
    limit: Joi.number()
});

// The addon links shown in the addon info
module.exports.links = Joi.object({
    website: Joi.string()
        .uri()
        .max(100),
    documentation: Joi.string()
        .uri()
        .max(150),
    donation: Joi.string()
        .uri()
        .max(150),
    source_code: Joi.string()
        .uri()
        .max(150)
});

// The addon creation validation
module.exports.create = Joi.object({
    name: Joi.string()
        .min(3)
        .max(25)
        .required(),
    info: Joi.string()
        .min(10)
        .max(50),
    description: Joi.string()
        .min(100)
        .max(1000),
    type: Joi.string()
        .valid("bk-plugin", "bc-plugin", "world", "datapack", "texturepack", "config")
        .required(),
    links: this.links,
    languages: Joi.array()
        .items(Joi.string().min(2).max(10)),
    price: Joi.number().max(100).default(0)
});

// The addon update validation
module.exports.updateAddon = Joi.object({
    name: Joi.string()
        .min(3)
        .max(25),
    info: Joi.string()
        .min(10)
        .max(50),
    description: Joi.string()
        .min(100)
        .max(1000),
    languages: Joi.array()
        .items(Joi.string().min(2).max(10)),
    price: Joi.number().max(100).default(0)
}).min(1);