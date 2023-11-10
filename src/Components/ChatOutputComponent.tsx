import React, { useState } from 'react';

const ChatOutputComponent = () => {
    // Example chat messages (replace with your actual data)
    const messages = ["Message 1", "Message 2"];

    return (
        <div className="border-2 border-dark-blue rounded-lg overflow-y-auto max-h-96 p-4">
            {messages.map((message, index) => (
                <p key={index} className="text-lg mb-2">{message}</p>
            ))}
        </div>
    );
}

export default ChatOutputComponent;
