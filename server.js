const express = require('express');
const http = require('http');
const WebSocket = 'ws');
const cors = require('cors');

const app = express();
const port = 3000;

// Use the simplest CORS configuration
app.use(cors());

// Standard server setup
app.use(express.json());


// ======================= THE TIMEOUT FIX IS HERE =======================
// This is the "Health Check" route. Render will visit this path.
// When it does, we send a success message to let Render know our server is running.
app.get('/', (req, res) => {
    res.status(200).send('Server is alive and running!');
});
// =====================================================================


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