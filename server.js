const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const port = process.env.PORT || 3000;

// CORS & preflight
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).send('Server is alive and running!');
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', ws => {
  console.log('✅ A new client connected');
});

function broadcast(data) {
  wss.clients.forEach(c => {
    if (c.readyState === WebSocket.OPEN) {
      c.send(JSON.stringify(data));
    }
  });
}

app.post('/api/order', (req, res) => {
  const { items, total } = req.body;
  console.log('🎉 NEW ORDER:', items, total);
  broadcast({ type: 'NEW_ORDER', payload: { items, total, time: new Date().toLocaleTimeString() } });
  res.status(200).json({ message: 'Full order received successfully!' });
});

server.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
