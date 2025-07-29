const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors()); 
app.use(bodyParser.json());

app.post('/api/order', (req, res) => {
    const { itemName, itemPrice } = req.body;

    console.log('🎉 ====== NEW ORDER ====== 🎉');
    console.log(`Item Name: ${itemName}`);
    console.log(`Price:     ${itemPrice}`);
    console.log('===========================');

    res.status(200).json({ message: `Order for ${itemName} received!` });
});

app.listen(port, () => {
    console.log(`✅ Backend server is running and listening at http://localhost:${port}`);
});