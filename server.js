/**
 * Express.js Backend for a Military Asset Management System.
 *
 * This server provides a RESTful API with CRUD (Create, Read, Update, Delete)
 * operations for military assets. It uses Mongoose to connect to a MongoDB database.
 *
 * To run this locally:
 * 1. Make sure you have Node.js and npm installed.
 * 2. Run 'npm install' to install dependencies (express, mongoose, cors, dotenv).
 * 3. Create a '.env' file in the root directory and add your MongoDB connection string:
 * MONGODB_URI=your_mongodb_connection_string
 * 4. Run 'node index.js' to start the server.
 *
 * This code is also configured for easy deployment to services like Render.
 */

// Import required modules
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Load environment variables from .env file

// Initialize the Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware setup
// Enable CORS for all routes to allow the frontend to access the API
app.use(cors());
// Parse incoming requests with JSON payloads
app.use(express.json());

// --- MongoDB Connection ---
// Check if the MONGODB_URI is set
if (!process.env.MONGODB_URI) {
    console.error('Error: MONGODB_URI environment variable is not set.');
    process.exit(1); // Exit the process with an error code
}

// Connect to the MongoDB database
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Successfully connected to MongoDB.'))
    .catch(err => console.error('Could not connect to MongoDB:', err));

// --- Mongoose Schema and Model ---
// Define the schema for an Asset
const assetSchema = new mongoose.Schema({
    // Name of the asset (e.g., "F-35 Lightning II")
    name: {
        type: String,
        required: true,
        trim: true
    },
    // Type of the asset (e.g., "aircraft", "vehicle", "ship")
    type: {
        type: String,
        required: true,
        trim: true
    },
    // Status of the asset (e.g., "operational", "maintenance", "deployed")
    status: {
        type: String,
        required: true,
        trim: true,
        enum: ['operational', 'maintenance', 'deployed', 'decommissioned']
    },
    // Location of the asset (e.g., "Kandahar Airfield", "USS Gerald R. Ford")
    location: {
        type: String,
        required: true,
        trim: true
    },
    // Description of the asset
    description: {
        type: String,
        required: false,
        trim: true
    },
    // Date of creation (automatically set)
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create the Mongoose model from the schema
const Asset = mongoose.model('Asset', assetSchema);

// --- API Routes ---
// Base route for the API, useful for a health check
app.get('/', (req, res) => {
    res.send('Military Asset System API is running.');
});

// GET all assets
app.get('/api/assets', async (req, res) => {
    try {
        const assets = await Asset.find();
        res.json(assets);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET a single asset by ID
app.get('/api/assets/:id', async (req, res) => {
    try {
        const asset = await Asset.findById(req.params.id);
        if (!asset) {
            return res.status(404).json({ message: 'Asset not found' });
        }
        res.json(asset);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST a new asset
app.post('/api/assets', async (req, res) => {
    // Create a new Asset instance from the request body
    const newAsset = new Asset({
        name: req.body.name,
        type: req.body.type,
        status: req.body.status,
        location: req.body.location,
        description: req.body.description
    });

    try {
        // Save the new asset to the database
        const savedAsset = await newAsset.save();
        res.status(201).json(savedAsset); // Respond with 201 Created status
    } catch (err) {
        res.status(400).json({ message: err.message }); // Respond with 400 Bad Request on validation error
    }
});

// PUT (Update) an existing asset by ID
app.put('/api/assets/:id', async (req, res) => {
    try {
        // Find the asset by ID and update it. The { new: true } option returns the updated document.
        const updatedAsset = await Asset.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedAsset) {
            return res.status(404).json({ message: 'Asset not found' });
        }
        res.json(updatedAsset);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE an asset by ID
app.delete('/api/assets/:id', async (req, res) => {
    try {
        const deletedAsset = await Asset.findByIdAndDelete(req.params.id);
        if (!deletedAsset) {
            return res.status(404).json({ message: 'Asset not found' });
        }
        // Respond with a success message
        res.json({ message: 'Asset successfully deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- Server Startup ---
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
