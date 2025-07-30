const express = require('express');
const http = require('http');
const WebSocket = require('ws');

// ======================= SERVER CONFIGURATION =======================
const app = express();
// This is the single most important line. It tells our server to use
// the port that Render's system provides. This fixes the timeout error.
const port = process.env.PORT || 3000;
// ====================================================================


// ======================= MIDDLEWARE SETUP ===========================
// This is the manual "permission slip" fix. It runs on every single
// request and adds the security headers the browser needs to see.
// This fixes the CORS error definitively.
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle the specific "preflight" request from the browser.
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    
    next();
});

// This allows our server to read the JSON data from the order.
app.use(express.json());
// ====================================================================


// ======================== SERVER ROUTES =============================
// This is the "Health Check" route. Render knocks on this door to
// make sure the server is alive. This also helps prevent timeouts.
app.get('/', (req, res) => {
    res.status(200).send('Server is alive and running.');
});

// This is the route that receives the customer's order.
app.post('/api/order', (req, res) => {
    const { items, total } = req.body;
    console.log('🎉 ====== NEW FULL ORDER RECEIVED ====== 🎉');
    items.forEach(item => { console.log(`- ${item.name} (x${item.quantity})`); });
    console.log(`GRAND TOTAL: ₹${total.toFixed(2)}`);

    // Broadcast the order to the dashboard.
    broadcast({
        type: 'NEW_ORDER',
        payload: { items: items, total: total, receivedAt: new Date().toLocaleTimeString() }
    });

    res.status(200).json({ message: 'Full order received successfully!' });
});
// ====================================================================


// ======================== WEBSOCKET SETUP ===========================
// We create an HTTP server and then attach our WebSocket server to it.
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// This function sends the new order data to all connected dashboards.
function broadcast(data) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

// Log when a dashboard connects.
wss.on('connection', ws => {
    console.log('✅ A new dashboard client has connected!');
});
// ====================================================================


// ======================== START THE SERVER ==========================
// We use server.listen because it starts both the HTTP and WebSocket parts.
server.listen(port, () => {
    console.log(`✅ Server is running on port ${port}`);
});
// ====================================================================