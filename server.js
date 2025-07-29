const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
const port = 3000;

// ======================== FINAL, EXPLICIT SECURITY CONFIGURATION ========================

// This is our master "VIP list". It includes BOTH your websites.
const allowedOrigins = [
    'https://kstawa.pages.dev',          // The customer menu site
    'https://order-notifications.pages.dev' // The notification dashboard site
];

// Configure CORS for standard HTTP requests (like placing an order)
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests if their origin is in our VIP list
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            // Block requests from any other website
            callback(new Error('This origin is not allowed by CORS'));
        }
    }
};

// Apply these security rules to the server
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
    ws.on('close', () => {
        console.log('A dashboard client has disconnected.');
    });
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