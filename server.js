const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

// --- Configure CORS to create a "VIP List" ---
// This list contains the URLs that are allowed to make requests.
const whitelist = ['https://kstawa.pages.dev']; // Your live frontend URL
const corsOptions = {
    origin: function (origin, callback) {
        // We allow requests from URLs in our whitelist.
        // We also allow requests that have no 'origin' (like from Postman or other tools).
        if (whitelist.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            // Otherwise, we block the request.
            callback(new Error('Not allowed by CORS'));
        }
    }
};

// --- Use the new configuration ---
app.use(cors(corsOptions)); 
app.use(bodyParser.json());

// UPDATED Endpoint to handle a full cart
app.post('/api/order', (req, res) => {
    const { items, total } = req.body;

    console.log('🎉 ====== NEW FULL ORDER RECEIVED ====== 🎉');
    
    items.forEach(item => {
        console.log(`- ${item.name} (x${item.quantity}) - Price: ₹${item.price * item.quantity}`);
    });

    console.log('-----------------------------------------');
    console.log(`GRAND TOTAL: ₹${total.toFixed(2)}`);
    console.log('=========================================');

    res.status(200).json({ message: `Full order received successfully!` });
});

app.listen(port, () => {
    console.log(`✅ Backend server is running and listening at http://localhost:${port}`);
});