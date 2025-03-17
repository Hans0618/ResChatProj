// src/components/RestaurantList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RestaurantList = () => {
    const [restaurants, setRestaurants] = useState([]);

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/restaurants');
                setRestaurants(response.data);
            } catch (error) {
                console.error('Error fetching restaurants:', error);
            }
        };

        fetchRestaurants();
    }, []);

    return (
        <div>
            <h1>Restaurants</h1>
            <ul>
                {restaurants.map((restaurant) => (
                    <li key={restaurant._id}>
                        {restaurant.name} - {restaurant.address}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default RestaurantList;