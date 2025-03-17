require('dotenv').config();
const axios = require('axios');
const Restaurant = require('./models/Restaurant'); // Ensure this path is correct

async function fetchRestaurants() {
    const latitude = 39.9899158;
    const longitude = -83.0062792;
    const API_KEY = 'AIzaSyAuAbt7ajYsKtC6V3zQCHCoLQTkXrBgUjM';
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=5000&type=restaurant&key=${API_KEY}`;
    
    try {
        const response = await axios.get(url);
        console.log('API Response:', response.data.results); // Log the response to verify
        const restaurants = response.data.results.map((place) => ({
            name: place.name,
            location: {
                type: 'Point',
                coordinates: [place.geometry.location.lng, place.geometry.location.lat],
            },
            address: place.vicinity,
            rating: place.rating,
        }));
        
        // Save to MongoDB
        await Restaurant.insertMany(restaurants);
        console.log('Restaurants saved to MongoDB');
        
        return restaurants;
    } catch (error) {
        console.error('Error fetching restaurants:', error.response ? error.response.data : error.message);
        return [];
    }
}

module.exports = fetchRestaurants;
