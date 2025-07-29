const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
const port = 3000;

// ======================== THE KEY FIX IS HERE ========================
// This uses the simplest CORS configuration to allow HTTP requests from ANY origin.
// This will solve the "Sorry, there was a problem placing your order" error.
app.use(cors());
// =====================================================================

// Standard server setup
app.use(express.json()); // The modern replacement for bodyParser

// ======================== WEBSOCKET SERVER SETUP ========================

// Create an HTTP server from our Express application
const server = http.createServer(app);

// Attach a WebSocket server to the HTTP server
const wss = new WebSocket.Server({ server });

// This function sends a message to all connected dashboards
function broadcast(data) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

// Log when a dashboard connects or disconnects
wss.on('connection', ws => {
    console.log('✅ A new dashboard client has connected!');
    ws.on('close', () => {
        console.log('A dashboard client has disconnected.');
    });
});

// ========================================================================


// --- API Endpoint for Receiving Orders (No changes needed here) ---
app.post('/api/order', (req, res) => {
    const { items, total } = req.body;

    // Log the order to the Render console
    console.log('🎉 ====== NEW FULL ORDER RECEIVED ====== 🎉');
    items.forEach(item => { console.log(`- ${item.name} (x${item.quantity})`); });
    console.log(`GRAND TOTAL: ₹${total.toFixed(2)}`);

    // Broadcast the order to the live dashboard
    broadcast({
        type: 'NEW_ORDER',
        payload: { items: items, total: total, receivedAt: new Date().toLocaleTimeString() }
    });

    // Send a success response back to the customer's website
    res.status(200).json({ message: `Full order received successfully!` });
});


// --- Start the Combined Server ---
server.listen(port, () => {
    console.log(`✅ Backend HTTP & WebSocket server is running on port ${port}`);
});