// fetchOverpassRestaurants.js
const axios = require('axios');
const fs = require('fs');

const latitude = 39.9899158;
const longitude = -83.0062792;
const radius = 5000; // in meters

async function fetchOverpassRestaurants() {
    const query = `
        [out:json];
        node
          ["amenity"="restaurant"]
          (around:${radius},${latitude},${longitude});
        out;
    `;
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

    try {
        const response = await axios.get(url);
        const restaurants = response.data.elements;
        console.log('Fetched Restaurants:', restaurants);

        // Save to a file
        fs.writeFileSync('restaurants.json', JSON.stringify(restaurants, null, 2));
        console.log('Data saved to restaurants.json');
    } catch (error) {
        console.error('Error fetching restaurants:', error.message);
    }
}

fetchOverpassRestaurants();