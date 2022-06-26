const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// Create a new express app
const app = express();

// Add all needed middlewares
app.use(cors());
app.use(express.json());
app.use(require('../middlewares/error'));

// Add rate limiting
app.use("*", rateLimit({windowMs: 10 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false}));

// Register routes
app.use("/user", require('../routes/user'));
app.use("/session", require('../routes/session'));
app.use("/addon", require('../routes/addon'));
app.use("/release", require('../routes/release'));
app.use("/server", require('../routes/server'));

// Register 404 route
app.use("*", (req, res) => {
    res.status(404).json({message: "Route not found"});
});

// Start the express server
module.exports.startServer = (port = 8352) => {
    app.listen(port, () => log(`Listening to port ${port}`));
}

// Stop the express server
module.exports.stopServer = () => {
    app.close();
    console.log("Closed the server");
}

// Log something in the express server
const log = (msg) => {
    console.log(`[Backend] ${msg}`);
}

module.exports.server = app;