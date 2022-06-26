const app = require('express').Router();
const {getSessions, getSessionFromUser, validateUser} = require('../controller/session');
const {validateSchema} = require('../util/validate');
const {create} = require('../validations/session');
const {isAuthenticatedUser} = require('../middlewares/authenticate');

// Lists all sessions from a user
app.get("/list", isAuthenticatedUser, async (req, res) => {
    res.json(await getSessions(req.user._id));
});

// Lists a specific session from a user by id
app.get("/:sessionId", isAuthenticatedUser, async (req, res) => {
    const session = await getSessionFromUser(req.user._id, req.params.sessionId);
    if (!session) return res.status(404).json({message: "The provided session does not exist"});

    res.json({_id: session._id, user_agent: session.user_agent, created: session.created});
});

// Creates a new session
app.put("/", async (req, res) => {
    const validation = await validateSchema(create, req.body);
    if (validation) return res.status(400).json({message: validation});

    const token = await validateUser(req.body.username, req.body.password, req.headers['user-agent']);
    if (!token) return res.status(401).json({message: "Username or password wrong"});

    res.status(201).json({message: "Successfully created the session", token: token});
});

// Deletes a session from a user by id
app.delete("/:sessionId", isAuthenticatedUser, async (req, res) => {
    const session = await getSessionFromUser(req.user._id, req.params.sessionId);
    if (!session) return res.status(404).json({message: "The provided session does not exist"});

    session.remove(() => res.json({message: "The session has been successfully removed"}));
});

module.exports = app;