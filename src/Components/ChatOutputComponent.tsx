import React from 'react';

const ChatOutputComponent = () => {
    // Example chat messages (replace with actual data)
    const messages = ["Message 1", "Message 2", /* ... more messages ... */];

    return (
        <div className="border-2 border-gray-900 mb-1 rounded-lg overflow-y-auto h-1/3 ml-8 w-4/5 bg-olive pl-3">
            {messages.map((message, index) => (
                <p key={index} className="text-lg mb-2 text-gray-900">{message}</p>
            ))}
        </div>
    );
}

export default ChatOutputComponent;
