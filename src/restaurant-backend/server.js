// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Restaurant = require('./models/Restaurant');

const app = express();

app.use(cors()); // Enable CORS

mongoose.connect('mongodb+srv://hans050618:F131663631@cluster0.ove5a.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

app.get('/api/restaurants', async (req, res) => {
    try {
        const restaurants = await Restaurant.find();
        console.log('Fetched Restaurants:', restaurants);
        res.json(restaurants);
    } catch (error) {
        console.error('Error fetching restaurants:', error);
        res.status(500).json({ error: 'Failed to fetch restaurants' });
    }
});

app.get('/api/restaurants/nearby', async (req, res) => {
    const { lat, lon } = req.query;
    try {
        const restaurants = await Restaurant.find({
            location: {
                $geoWithin: {
                    $centerSphere: [[lon, lat], 5 / 6378.1] // 5 km radius
                }
            }
        });
        res.json(restaurants);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch nearby restaurants' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});