const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();

// Port: use Render’s $PORT or fall back to 3000 locally
const port = process.env.PORT || 3000;

// CORS: add headers to every response
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// JSON parsing
app.use(express.json());

// Health‑check endpoint
app.get('/', (req, res) => {
  res.status(200).send('Server is alive and running!');
});

// WebSocket setup
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

// API endpoint for orders
app.post('/api/order', (req, res) => {
  const { items, total } = req.body;
  console.log('🎉 ====== NEW FULL ORDER RECEIVED ====== 🎉');
  items.forEach(item => console.log(`- ${item.name} (x${item.quantity})`));
  console.log(`GRAND TOTAL: ₹${total.toFixed(2)}`);

  broadcast({
    type: 'NEW_ORDER',
    payload: {
      items,
      total,
      receivedAt: new Date().toLocaleTimeString()
    }
  });

  res.status(200).json({ message: 'Full order received successfully!' });
});

// Start server on the correct port
server.listen(port, () => {
  console.log(`✅ Backend HTTP & WebSocket server is running on port ${port}`);
});
