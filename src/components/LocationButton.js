import React from 'react';

function LocationButton({ onLocation }) {
    const getLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    onLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                },
                (error) => {
                    console.error("Error getting location: ", error);
                    alert("Unable to access your location. Please check browser permissions.");
                }
            );
        } else {
            alert("Geolocation is not supported by your browser.");
        }
    };

    return (
        <button className="location-button" onClick={getLocation}>
            📍 Get Location
        </button>
    );
}

export default LocationButton;
