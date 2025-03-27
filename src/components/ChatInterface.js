import React, { useState, useEffect } from 'react';
import ChatDisplay from './ChatDisplay';
import ChatInput from './ChatInput';
import LocationButton from './LocationButton';
import '../App.css';

const ChatInterface = () => {
    const [messages, setMessages] = useState([]);
    const [location, setLocation] = useState(null);

    // 👋 Initial greeting on load
    useEffect(() => {
        const greeting = {
            sender: 'bot',
            text: "Hi there! I’m your restaurant assistant. I can help you find nearby restaurants, explore by cuisine, or suggest something popular. What are you craving today?",
        };
        setMessages([greeting]);
    }, []);

    const handleSend = async (text) => {
        const newMessage = { sender: 'user', text };
        setMessages((prev) => [...prev, newMessage]);

        try {
            const response = await fetch('http://localhost:5000/api/query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: text, location }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            const botMessage = { sender: 'bot', text: data.response };
            setMessages((prev) => [...prev, botMessage]);
        } catch (error) {
            console.error('Error getting location:', error);
            const botMessage = { sender: 'bot', text: "Unable to access location. Please provide your location manually." };
            setMessages((prev) => [...prev, botMessage]);
        }
    };

    return (
        <div className="chat-container">
            <div className="chatbot-header">🍽️ Restaurant Chatbot</div>

            <div className="chat-tabs">
                <div className="chat-tab">Nearby</div>
                <div className="chat-tab">Popular</div>
                <div className="chat-tab">By Cuisine</div>
            </div>

            <div className="location-button">
                <LocationButton onLocation={setLocation} />
            </div>

            <ChatDisplay messages={messages} />
            <ChatInput onSend={handleSend} />
        </div>
    );
};

export default ChatInterface;
