const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
const port = 3000;

// --- STEP 1: USE THE SIMPLEST CORS CONFIGURATION ---
// This tells the server to accept HTTP requests from ANY origin.
// This is often necessary for the initial WebSocket handshake on platforms like Render.
app.use(cors());

// --- STEP 2: The rest of the HTTP server setup ---
app.use(express.json()); // Replaces bodyParser

// --- API Endpoint (remains the same) ---
app.post('/api/order', (req, res) => {
    const { items, total } = req.body;
    console.log('🎉 ====== NEW FULL ORDER RECEIVED ====== 🎉');
    items.forEach(item => { console.log(`- ${item.name} (x${item.quantity})`); });
    console.log(`GRAND TOTAL: ₹${total.toFixed(2)}`);

    // Broadcast the order to all connected dashboards
    broadcast({
        type: 'NEW_ORDER',
        payload: { items: items, total: total, receivedAt: new Date().toLocaleTimeString() }
    });

    res.status(200).json({ message: `Full order received successfully!` });
});


// ======================== WEBSOCKET SERVER SETUP ========================

// 1. Create the HTTP server from our Express app
const server = http.createServer(app);

// 2. Attach the WebSocket server to the HTTP server
const wss = new WebSocket.Server({ server });

// 3. Broadcast function (sends message to all dashboards)
function broadcast(data) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

// 4. Handle dashboard connections
wss.on('connection', ws => {
    console.log('✅ A new dashboard client has connected!');
    ws.on('close', () => {
        console.log('A dashboard client has disconnected.');
    });
});

// ========================================================================


// --- Start the combined server ---
server.listen(port, () => {
    console.log(`✅ Backend HTTP & WebSocket server is running on port ${port}`);
});