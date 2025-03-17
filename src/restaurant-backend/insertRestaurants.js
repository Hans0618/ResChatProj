// insertRestaurants.js
const fs = require('fs');
const mongoose = require('mongoose');
const Restaurant = require('./models/Restaurant'); // Ensure this path is correct

mongoose.connect('mongodb+srv://hans050618:F131663631@cluster0.ove5a.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

async function insertRestaurants() {
    try {
        const data = fs.readFileSync('restaurants.json', 'utf8');
        const rawRestaurants = JSON.parse(data);

        const restaurants = rawRestaurants.map((item) => ({
            name: item.tags.name || 'Unknown',
            location: {
                type: 'Point',
                coordinates: [item.lon, item.lat], // Ensure correct order: [longitude, latitude]
            },
            address: item.address || 'Not provided',
            additionalAttributes: {
                ...item,
                lat: undefined,
                lon: undefined,
            },
        }));

        await Restaurant.insertMany(restaurants);
        console.log('Restaurants inserted into MongoDB');
    } catch (error) {
        console.error('Error inserting restaurants:', error.message);
    } finally {
        mongoose.connection.close();
    }
}

insertRestaurants();