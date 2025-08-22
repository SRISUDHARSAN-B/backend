// --- Required Dependencies ---
// Install these dependencies by running:
// npm install express cors body-parser jsonwebtoken bcryptjs

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize the Express app
const app = express();
const PORT = process.env.PORT || 3001; // Use Render's assigned port or 3001 locally

// --- Configuration & Middleware ---
// CORS for allowing cross-origin requests from the frontend
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*', // Set this to your Netlify URL in production
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Body-parser middleware to handle JSON data in requests
app.use(bodyParser.json());

// A simple in-memory database for demonstration purposes.
// In a real application, you would connect to a database like MongoDB.
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

// Secret key for JWT. This should be stored in an environment variable in a production app.
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key';

// --- JWT Authentication Middleware ---
// This function verifies the JWT token and adds user info to the request object.
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.status(401).json({ message: 'Authentication token is required.' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token.' });
        }
        req.user = user;
        next();
    });
};

// --- Role-Based Access Control (RBAC) Middleware ---
// This middleware checks if the user has the required role.
const authorizeRole = (requiredRole) => (req, res, next) => {
    if (req.user.role !== requiredRole) {
        return res.status(403).json({ message: 'Forbidden: You do not have the required permissions.' });
    }
    next();
};

// --- API Endpoints ---

// Home route
app.get('/', (req, res) => {
    res.send('Military Asset Management Backend is running!');
});

// --- Authentication Endpoints ---

// POST /api/auth/signup
// Handles user registration. In a real app, you would add a 'role' to the user.
app.post('/api/auth/signup', async (req, res) => {
    const { email, password } = req.body;

    // Check if user already exists
    if (users.find(user => user.email === email)) {
        return res.status(409).json({ message: 'User with that email already exists.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            id: users.length + 1,
            email,
            password: hashedPassword,
            role: 'logistics', // Default role for new users
        };
        users.push(newUser);
        console.log('New user signed up:', newUser);

        const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET);
        res.status(201).json({ message: 'Account created successfully!', token });

    } catch (error) {
        res.status(500).json({ message: 'Error creating user account.', error });
    }
});

// POST /api/auth/login
// Handles user login and returns a JWT token.
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);

    if (!user) {
        return res.status(404).json({ message: 'User not found.' });
    }

    try {
        if (await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
            res.status(200).json({ message: 'Login successful!', token });
        } else {
            res.status(401).json({ message: 'Invalid credentials.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error during login.' });
    }
});

// --- Asset Management Endpoints (Protected) ---

// GET /api/assets/inventory
// Get the current list of assets. Requires a valid token.
app.get('/api/assets/inventory', authenticateToken, (req, res) => {
    // This endpoint is accessible to all authenticated users
    res.json(assets.inventory);
});

// POST /api/assets/purchase
// Record a new asset purchase. Requires 'logistics' or 'admin' role.
app.post('/api/assets/purchase', authenticateToken, authorizeRole('logistics'), (req, res) => {
    const newPurchase = { ...req.body, id: Date.now() };
    assets.purchases.push(newPurchase);
    res.status(201).json({ message: 'Purchase recorded successfully!', data: newPurchase });
});

// POST /api/assets/transfer
// Initiate a transfer of assets. Requires 'logistics' or 'admin' role.
app.post('/api/assets/transfer', authenticateToken, authorizeRole('logistics'), (req, res) => {
    const newTransfer = { ...req.body, id: Date.now() };
    assets.transfers.push(newTransfer);
    res.status(201).json({ message: 'Transfer initiated successfully!', data: newTransfer });
});

// POST /api/assets/assignment
// Assign assets to personnel. Requires 'logistics' or 'admin' role.
app.post('/api/assets/assignment', authenticateToken, authorizeRole('logistics'), (req, res) => {
    const newAssignment = { ...req.body, id: Date.now() };
    assets.assignments.push(newAssignment);
    res.status(201).json({ message: 'Asset assigned successfully!', data: newAssignment });
});

// POST /api/assets/expenditure
// Record an asset expenditure. Requires 'logistics' or 'admin' role.
app.post('/api/assets/expenditure', authenticateToken, authorizeRole('logistics'), (req, res) => {
    const newExpenditure = { ...req.body, id: Date.now() };
    assets.expenditures.push(newExpenditure);
    res.status(201).json({ message: 'Expenditure recorded successfully!', data: newExpenditure });
});


// --- Start the Server ---
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
