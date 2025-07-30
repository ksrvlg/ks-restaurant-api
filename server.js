const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();

// Use Render’s PORT or default to 3000
const port = process.env.PORT || 3000;

// CORS – respond to ALL preflight OPTIONS and allow POST/GET
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// JSON parsing
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.status(200).send('Server is alive and running!');
});

// Create HTTP + WS server
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Broadcast helper
function broadcast(data) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

// WS connection handler
wss.on('connection', ws => {
  console.log('✅ A new dashboard client has connected!');
});

// POST /api/order handler
app.post('/api/order', (req, res) => {
  const { items, total } = req.body;
  console.log('🎉 ====== NEW ORDER ======');
  items.forEach(i => console.log(`- ${i.name} x${i.quantity}`));
  console.log(`TOTAL: ₹${total}`);

  broadcast({ type: 'NEW_ORDER', payload: { items, total, time: new Date().toLocaleTimeString() } });
  res.status(200).json({ message: 'Full order received successfully!' });
});

// Start listening
server.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
