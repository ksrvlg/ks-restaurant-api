const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http'); // Import the built-in http module
const WebSocket = require('ws'); // Import the WebSocket library

const app = express();
const port = 3000;

// --- CORS Configuration ---
// This remains the same, for the customer menu website.
const corsOptions = {
    origin: 'https://kstawa.pages.dev',
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(bodyParser.json());

// ======================== HTTP & WEBSOCKET SERVER SETUP ========================

// 1. Create a standard HTTP server using the Express app
const server = http.createServer(app);

// 2. Create a WebSocket server and attach it to the HTTP server
const wss = new WebSocket.Server({ server });

// 3. This function will send a message to ALL connected dashboards
function broadcast(data) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

// 4. Log when a dashboard connects
wss.on('connection', ws => {
    console.log('✅ A new dashboard client has connected!');
    ws.on('close', () => {
        console.log('A dashboard client has disconnected.');
    });
});

// ==============================================================================


// --- Your existing API endpoint to RECEIVE orders ---
app.post('/api/order', (req, res) => {
    const { items, total } = req.body;

    console.log('🎉 ====== NEW FULL ORDER RECEIVED ====== 🎉');
    items.forEach(item => {
        console.log(`- ${item.name} (x${item.quantity})`);
    });
    console.log(`GRAND TOTAL: ₹${total.toFixed(2)}`);

    // --- CRITICAL NEW STEP ---
    // After receiving an order, broadcast it to all connected dashboards
    broadcast({
        type: 'NEW_ORDER',
        payload: {
            items: items,
            total: total,
            receivedAt: new Date().toLocaleTimeString()
        }
    });

    res.status(200).json({ message: `Full order received successfully!` });
});

// --- Start the combined server ---
// Note we are using server.listen, not app.listen
server.listen(port, () => {
    console.log(`✅ Backend HTTP & WebSocket server is running on port ${port}`);
});