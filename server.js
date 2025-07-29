const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

// ======================= NEW, MORE EXPLICIT CORS CONFIGURATION =======================
const corsOptions = {
    origin: 'https://kstawa.pages.dev', // Only allow requests from your live website
    optionsSuccessStatus: 200 // For compatibility with older browsers
};

// Use the new CORS options
app.use(cors(corsOptions));
// ===================================================================================

app.use(bodyParser.json());

// The rest of the file is the same
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