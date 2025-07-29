const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();

// ======================= THE DEFINITIVE PORT & TIMEOUT FIX =======================
// This tells the server to use the port Render assigns (like 10000),
// or fall back to 3000 for local testing. THIS SOLVES THE TIMEOUT.
const port = process.env.PORT || 3000;
// =================================================================================


// ======================= THE DEFINITIVE CORS FIX =======================
// This manually adds the "permission slip" to every request.
// It is the most robust way to solve the CORS error.
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});
// =====================================================================

// Standard server setup
app.use(express.json());

// Health Check route that Render's health checker will use.
app.get('/', (req, res) => {
    res.status(200).send('Server is alive and running!');
});

// ======================== WEBSOCKET SERVER SETUP ========================
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

function broadcast(data) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

wss.on('connection', ws => {
    console.log('✅ A new dashboard client has connected!');
});
// ========================================================================


// --- API Endpoint for Receiving Orders ---
app.post('/api/order', (req, res) => {
    const { items, total } = req.body;
    console.log('🎉 ====== NEW FULL ORDER RECEIVED ====== 🎉');
    items.forEach(item => { console.log(`- ${item.name} (x${item.quantity})`); });
    console.log(`GRAND TOTAL: ₹${total.toFixed(2)}`);

    broadcast({
        type: 'NEW_ORDER',
        payload: { items: items, total: total, receivedAt: new Date().toLocaleTimeString() }
    });

    res.status(200).json({ message: `Full order received successfully!` });
});


// --- Start the Combined Server ---
server.listen(port, () => {
    // This will now log the correct port number Render is using.
    console.log(`✅ Backend HTTP & WebSocket server is running on port ${port}`);
});