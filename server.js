const express = require('express');
const app = express();

// This is the most important line. It tells the server to use the
// port number that Render provides. This fixes the timeout error.
const port = process.env.PORT || 3000;

// This is the health check. It proves the server is running.
app.get('/', (req, res) => {
    res.status(200).send('Hello from the stable server! The deployment is working.');
});

// This starts the server.
app.listen(port, () => {
    console.log(`✅ Stable server is running and listening on port ${port}`);
});```