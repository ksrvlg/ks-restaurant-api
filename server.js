const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const port = 3000;

// ======================== FINAL, COMBINED CORS CONFIGURATION ========================
// This is our new VIP list that includes BOTH of your websites.
const allowedOrigins = [
    'https://kstawa.pages.dev',          // The customer menu
    'https://order-notifications.pages.dev' // The notification dashboard
];

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests if their origin is in our allowed list.
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('This origin is not allowed by CORS'));
        }
    }
};

// Use the new, more flexible CORS options for all HTTP requests.
app.use(cors(corsOptions));
// ===================================================================================

app.use(bodyParser.json());

// --- HTTP & WEBSOCKET SERVER SETUP ---
const server = http.createServer(app);

// In the WebSocket server options, we also check the origin.
const wss = new WebSocket.Server({
    server,
    verifyClient: (info, done) => {
        // Check if the connection origin is in our allowed list.
        if (allowedOrigins.indexOf(info.origin) !== -1) {
            done(true);
        } else {
            done(false, 403, 'This origin is forbidden');
        }
    }
});

function broadcast(data) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

wss.on('connection', ws => {
    console.log('✅ A new dashboard client has connected!');
    ws.on('close', () => {
        console.log('A dashboard client has disconnected.');
    });
});

// --- API Endpoint ---
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

// --- Start Server ---
server.listen(port, () => {
    console.log(`✅ Backend HTTP & WebSocket server is running on port ${port}`);
});