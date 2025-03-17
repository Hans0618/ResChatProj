// src/App.js
import React, { useState } from 'react';
import ChatDisplay from './components/ChatDisplay';
import ChatInput from './components/ChatInput';
import axios from 'axios';

function App() {
    const [messages, setMessages] = useState([]);

    const handleSend = async (input) => {
        const userMessage = { sender: 'user', text: input };
        setMessages((prev) => [...prev, userMessage]);

        // Example: Fetch restaurant data based on user input
        if (input.toLowerCase().includes('restaurant')) {
            try {
                const response = await axios.get('http://localhost:3000/api/restaurants');
                const botMessage = {
                    sender: 'bot',
                    text: `Here are some restaurants: ${response.data.map(r => r.name).join(', ')}`,
                };
                setMessages((prev) => [...prev, botMessage]);
            } catch (error) {
                const errorMessage = { sender: 'bot', text: 'Sorry, I could not fetch restaurant data.' };
                setMessages((prev) => [...prev, errorMessage]);
            }
        }
    };

    return (
        <div className="App">
            <h1>Restaurant Chatbot</h1>
            <ChatDisplay messages={messages} />
            <ChatInput onSend={handleSend} />
        </div>
    );
}

export default App;