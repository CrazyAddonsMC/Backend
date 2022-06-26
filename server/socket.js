const {WebSocketServer} = require("ws");
const {authenticateServer} = require("../socket/actions");
const {setServerOnline} = require("../controller/link");
const crypto = require("crypto");
const {setWsHeartbeat} = require("ws-heartbeat/server");

let server;
let clients = [];
let requestQueue = [];

// Create & start the new websocket server
module.exports.startServer = (port = 8353) => {
    server = new WebSocketServer({port});
    initialize();
    log(`Listening to port ${port}`);
}

// Stop the websocket server
module.exports.stopServer = () => {
    server.close();
    server = undefined;
    log("Closed the server");
}

// Initializes and adds the socket listener
const initialize = () => {
    server.on('connection', client => handleClientRequests(client));

    setWsHeartbeat(server, (ws, data) => {
        try {
            if (JSON.parse(data).code === 7) { // Heartbeat
                ws.send(JSON.stringify({code: 7}));
            }
        } catch (e) {
        }
    }, 5000);
}

// Handle all messages by the client
const handleClientRequests = (client) => {
    client.on('message', data => {
        try {
            handleClientData(client, JSON.parse(data.toString()));
        } catch (e) {
        }
    });

    client.on('close', async () => this.closeServerConnectionByClient(client));
}

// Handle client json data
const handleClientData = (client, json) => {
    if (!json.code) return;
    if (!json.data) return;

    // Resolve request
    if (json.code === 6 && json.data.requestId) {
        const request = requestQueue[json.data.requestId];
        delete json.data.requestId;
        if (request) request.resolve(json.data);
        return;
    }

    // Authenticate
    if (json.code === 1) {
        for (const current in clients)
            if (client === clients[current].client) return;

        authenticateServer(client, json.data)
            .then(currentServer => {
                if (!currentServer) return;

                for (const current in clients)
                    if (currentServer._id.toString() === clients[current].id) return client.send(JSON.stringify({
                        code: 5,
                        message: "Already connected"
                    }));

                client.send(JSON.stringify({code: 3, message: "Authentication success"}));

                clients.push({id: currentServer._id.toString(), user_id: currentServer.user_id.toString(), client});
            });
    }
}

// Get the server by the client object
module.exports.getServerByClient = async (client) => {
    for (const current in clients) {
        if (client === clients[current].client) return clients[current];
    }
    return null;
}

// Close the server connection by the client object
module.exports.closeServerConnectionByClient = async (client) => {
    for (const current in clients) {
        if (client === clients[current].client) {
            await setServerOnline(clients[current].id, false);
            client.send(JSON.stringify({code: 4, message: "Authentication renewal required"}));
            clients = clients.filter(e => e.id !== clients[current].id);
        }
    }
}

// Close the server connection by the server id
module.exports.closeServerConnectionById = async (server_id) => {
    for (const current in clients) {
        if (server_id === clients[current].id) {
            await setServerOnline(clients[current].id, false);
            clients[current].client.send(JSON.stringify({code: 4, message: "Authentication renewal required"}));
            clients = clients.filter(e => e.id !== clients[current].id);
        }
    }
}

// Check if the server is connected
module.exports.isConnected = (server_id) => {
    for (const current in clients)
        if (server_id === clients[current].id) return true
    return false;
}

// Broadcast message to a specific server by id
module.exports.broadcastToServer = (server_id, code, data) => {
    clients.forEach(client => client.id === server_id ? client.client.send(JSON.stringify({code, data})) : "");
}

// Get specific information from the server
module.exports.getInformationFromServer = async (server_id, code, data) => {
    if (!this.isConnected(server_id)) return null;
    const requestId = crypto.randomBytes(48).toString('hex');
    const request = requestQueue[requestId] = {};

    await this.broadcastToServer(server_id, 6, {code, requestId, ...data});

    try {
        return await new Promise((resolve, reject) => {
            request.resolve = resolve;

            setTimeout(() => reject('Timed out'), 5000);
        }).catch(() => null);
    } finally {
        delete requestQueue[requestId];
    }
}

// Log something in the websocket server
const log = (msg) => {
    console.log(`[Socket] ${msg}`);
}

module.exports.server = server;