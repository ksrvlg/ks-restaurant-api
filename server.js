const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
const port = 3000;

// ================= THE DEFINITIVE FIX: MANUALLY HANDLE THE PREFLIGHT REQUEST =================
// This creates a specific route that ONLY handles the browser's initial "OPTIONS" permission check.
// The '/*' means it will work for any path, including /api/order.
app.options('/*', (req, res) => {
    // Manually send the required "permission slip" headers.
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    
    // Send a 200 OK status to tell the browser the check was successful.
    res.sendStatus(200);
});
// ==============================================================================================

// Use the cors library for all OTHER requests (like the actual POST order)
app.use(cors());

// Standard server setup
app.use(express.json());

// Health Check route to prevent Render timeouts
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
    console.log(`✅ Backend HTTP & WebSocket server is running on port ${port}`);
});