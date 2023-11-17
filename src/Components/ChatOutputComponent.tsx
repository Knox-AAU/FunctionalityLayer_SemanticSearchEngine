import React, { useState } from 'react';

type ChatComponentProps = {
  chatMessages: ChatMessage[];
  onChat: (query: string) => void;
};

type ChatMessage = {
  text: string;
  sender: 'user' | 'backend';
};

const ChatOutputComponent: React.FC<ChatComponentProps> = ({ chatMessages, onChat }) => {
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
    <div className="border-2 border-gray-900 mb-1 rounded-lg overflow-y-auto h-1/3 ml-8 w-4/5 bg-olive ">
      <div className=" mb-1 rounded-lg overflow-y-auto h-4/5 ml-8 w-4/5 bg-olive ">
        {chatMessages.map((message, index) => (
          <p key={index} className="text-lg mb-2 text-gray-900">
            {message.text}
          </p>
        ))}
      </div>
      <div className="search-bar rounded-lg mb-2 w-4/4 pl-2 pr-2 py-2 bg-darkolive">
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
    </div>
  );
};

export default ChatOutputComponent;
