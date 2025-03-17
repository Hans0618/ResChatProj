// src/components/ChatDisplay.js
import React from 'react';

const ChatDisplay = ({ messages }) => {
    return (
        <div className="chat-display">
            {messages.map((msg, index) => (
                <div key={index} className={`message ${msg.sender}`}>
                    {msg.text}
                </div>
            ))}
        </div>
    );
};

export default ChatDisplay;