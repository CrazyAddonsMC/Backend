const app = require('express').Router();
const rateLimit = require('express-rate-limit');
const {validateSchema} = require('../util/validate');
const {createUser, updateUser, updateSocials} = require('../validations/user');
const {getUserByName, createAccount, updateAccount, updateUserSocials} = require('../controller/user');
const {isAuthenticatedUser} = require('../middlewares/authenticate');

// Defines the rate limit to create a new account
const rateLimiter = rateLimit({windowMs: 60 * 60 * 1000, max: 2, standardHeaders: true, legacyHeaders: false});

// Create a new user
app.put("/", rateLimiter, async (req, res) => {
    const validation = await validateSchema(createUser, req.body);
    if (validation) return res.status(400).json({message: validation});

    const user = await getUserByName(req.body.username);
    if (user) return res.status(409).json({message: "This username already exists, please choose another."});

    try {
        res.status(201).json({
            message: "Successfully created the account",
            id: (await createAccount(req.body.username, req.body.email, req.body.password))._id
        });
    } catch (e) {
        res.status(500).json({message: "An internal error occurred"});
    }
});

// Updates the user information
app.patch("/", isAuthenticatedUser, async (req, res) => {
    const validation = await validateSchema(updateUser, req.body);
    if (validation) return res.status(400).json({message: validation});

    if (req.body.username) {
        const user = await getUserByName(req.body.username);
        if (user) return res.status(409).json({message: "This username already exists, please choose another."});
    }

    const updatedUser = await updateAccount(req.user._id, req.body);
    if (!updatedUser) return res.status(500).json({message: "An internal error occurred"});

    res.json({message: "Your changes were successfully applied"});
});

// Updates the user socials
app.patch("/socials", isAuthenticatedUser, async (req, res) => {
    const validation = await validateSchema(updateSocials, req.body);
    if (validation) return res.status(400).json({message: validation});

    const socials = await updateUserSocials(req.user._id, req.body);
    if (!socials) return res.status(500).json({message: "An internal error occurred"});

    res.json({message: "Your changes were successfully applied"});
});

// Gets a specific user by name
app.get("/:username", async (req, res) => {
    const user = await getUserByName(req.params.username);
    if (user === null) return res.status(404).json({message: "The provided user does not exist"});
    user.password = undefined
    user.__v = undefined

    res.json(user);
});

module.exports = app;