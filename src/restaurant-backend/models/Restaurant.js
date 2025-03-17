const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
    name: String,
    location: {
        type: { type: String, default: 'Point' },
        coordinates: [Number],
    },
    address: String,
});

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

module.exports = Restaurant;