const mongoose = require('mongoose');
const socketServer = require('./server/socket');
const expressServer = require('./server/api');
const downloadServer = require('./server/download');
const mediaServer = require('./server/media');
require('dotenv').config();

// Connect to the database
mongoose.connect(process.env.MONGOOSE_STRING, (e) => {
    if (!e) {
        console.log("Successfully connected to the database");
        start();
    } else console.error("Could not connect to the database: " + e.toString());
});

// Starts all servers
const start = () => {
    expressServer.startServer(process.env.EXPRESS_PORT || 8352);
    socketServer.startServer(process.env.SOCKET_PORT || 8353);
    mediaServer.startServer(process.env.MEDIA_PORT || 8354);
    downloadServer.startServer(process.env.DOWNLOAD_PORT || 8355, process.env.RELEASE_PATH || "/mnt/data/download");
}