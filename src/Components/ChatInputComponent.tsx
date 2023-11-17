import React, { useState } from 'react';

type ChatInputComponentProps = {
  onChat: (query: string) => void;
};

const ChatInputComponent: React.FC<ChatInputComponentProps> = ({ onChat }) => {
  const [chatQuery, setChatQuery] = useState('');
  const [chatLanguage, setChatLanguage] = useState('autodetect');

  const handleChat = () => {
    if (chatQuery) {
      onChat(chatQuery);
      setChatQuery('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleChat();
    }
  };

  return (
    <div className="chat-bar border-2 border-gray-900 rounded-lg mb-2 pl-6 py-2 bg-olive">
      <input
        type="text"
        value={chatQuery}
        onChange={(e) => setChatQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        className="border p-2 mr-2 w-4/5"
      />
      <button onClick={handleChat} className="bg-blue-500 text-white p-2 rounded">
        Send
      </button>
      {/* Dropdown Menu for Language Selection */}
      <label className="mr-2 pl-2">Language:</label>
      <select
        value={chatLanguage}
        onChange={(e) => setChatLanguage(e.target.value)}
        className="border p-1 rounded"
      >
        <option value="danish">Danish</option>
        <option value="english">English</option>
        <option value="autodetect">auto detect</option>
      </select>
    </div>
  );
};

export default ChatInputComponent;
