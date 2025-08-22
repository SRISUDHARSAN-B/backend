// --- Required Dependencies ---
// Install these dependencies by running:
// npm install express cors body-parser

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Initialize the Express app
const app = express();
const PORT = process.env.PORT || 3001; // Use Render's assigned port or 3001 locally

// --- Configuration & Middleware ---
// CORS for allowing cross-origin requests from the frontend
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Body-parser middleware to handle JSON data in requests
app.use(bodyParser.json());

// A simple in-memory database for demonstration purposes.
const users = [];
const assets = {
    inventory: [
        { base: 'Fort Bravo', equipmentType: 'Rifle (M4)', openingBalance: 500, closingBalance: 480, assigned: 15, expended: 5, netMovement: -20 },
        { base: 'Fort Alpha', equipmentType: 'Grenade (M67)', openingBalance: 1200, closingBalance: 1150, assigned: 0, expended: 50, netMovement: -50 },
        { base: 'Naval Base Charlie', equipmentType: 'Night Vision Goggles', openingBalance: 150, closingBalance: 150, assigned: 0, expended: 0, netMovement: 0 },
        { base: 'Airfield Delta', equipmentType: 'Aircraft (F-35)', openingBalance: 20, closingBalance: 20, assigned: 0, expended: 0, netMovement: 0 },
    ],
    purchases: [],
    transfers: [],
    assignments: [],
    expenditures: [],
};

// --- API Endpoints ---

// Home route
app.get('/', (req, res) => {
    res.send('Simple Military Asset Management Backend is running!');
});

// --- Authentication Endpoints (Simulated) ---
// These endpoints now just return a success message.
// There is no real authentication.

// POST /api/auth/signup
app.post('/api/auth/signup', (req, res) => {
    const { email, password } = req.body;
    // In this simplified version, we just log the user data and pretend it worked.
    console.log(`User signed up: ${email}`);
    res.status(201).json({ message: 'Account created successfully!' });
});

// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    // Simply respond with success regardless of credentials.
    res.status(200).json({ message: 'Login successful!' });
});

// --- Asset Management Endpoints (Unprotected) ---
// These endpoints are now publicly accessible.

// GET /api/assets/inventory
app.get('/api/assets/inventory', (req, res) => {
    res.json(assets.inventory);
});

// POST /api/assets/purchase
app.post('/api/assets/purchase', (req, res) => {
    const newPurchase = { ...req.body, id: Date.now() };
    assets.purchases.push(newPurchase);
    res.status(201).json({ message: 'Purchase recorded successfully!', data: newPurchase });
});

// POST /api/assets/transfer
app.post('/api/assets/transfer', (req, res) => {
    const newTransfer = { ...req.body, id: Date.now() };
    assets.transfers.push(newTransfer);
    res.status(201).json({ message: 'Transfer initiated successfully!', data: newTransfer });
});

// POST /api/assets/assignment
app.post('/api/assets/assignment', (req, res) => {
    const newAssignment = { ...req.body, id: Date.now() };
    assets.assignments.push(newAssignment);
    res.status(201).json({ message: 'Asset assigned successfully!', data: newAssignment });
});

// POST /api/assets/expenditure
app.post('/api/assets/expenditure', (req, res) => {
    const newExpenditure = { ...req.body, id: Date.now() };
    assets.expenditures.push(newExpenditure);
    res.status(201).json({ message: 'Expenditure recorded successfully!', data: newExpenditure });
});

// --- Start the Server ---
app.listen(PORT, () => {
    console.log(`Simple backend server running on http://localhost:${PORT}`);
});
