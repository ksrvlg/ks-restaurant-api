const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
const port = 3000;

// ======================== FINAL, ROBUST SECURITY CONFIGURATION ========================

// This is our master "VIP list" for all connections.
const allowedOrigins = [
    'https://kstawa.pages.dev',
    'https://order-notifications.pages.dev'
];

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests if their origin is in our VIP list (or if they have no origin)
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('This origin is not allowed by CORS'));
        }
    }
};

// --- THIS IS THE CRITICAL FIX for the "preflight" error ---
// This tells the server to correctly handle the browser's permission check (the OPTIONS request)
// before any other request.
app.options('*', cors(corsOptions));

// This applies the security rules to all other requests (like POST for orders).
app.use(cors(corsOptions));

// =======================================================================================

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