const express = require('express');

// Create a new express app
const app = express();

// Register routes

// TODO: Create media server

// Start the media server
module.exports.startServer = (port = 8354) => {
    app.listen(port, () => log(`Listening to port ${port}`));
}

// Stop the media server
module.exports.stopServer = () => {
    app.close();
    console.log("Closed the server");
}

// Log something in the media server
const log = (msg) => {
    console.log(`[Media] ${msg}`);
}

module.exports.server = app;