import React, { useState } from 'react';

type ChatComponentProps = {
  chatMessages: ChatMessage[];
  onChat: (query: string) => void;
};

type ChatMessage = {
  text: string;
  sender: 'user' | 'backend';
};

const ChatComponent: React.FC<ChatComponentProps> = ({ chatMessages, onChat }) => {
  const [chatQuery, setChatQuery] = useState('');
  const [chatLanguage, setChatLanguage] = useState('autodetect');
  const [isMessagesVisible, setIsMessagesVisible] = useState(true);

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

  const toggleMessagesVisibility = () => {
    setIsMessagesVisible(!isMessagesVisible);
  };

  return (
    <div className={" mb-2 rounded-lg overflow-hidden h-2/3 ml-8 w-4/5 bg-gray-900 "}style={{ maxHeight: isMessagesVisible ? 'calc(100% - 12rem)' : '12rem' }}>
      
      {/* Chart output*/}
      <div className={`rounded-lg overflow-y-auto pl-4 w-7/8 bg-olive border-2 border-gray-900 `} style={{ maxHeight: isMessagesVisible ? 'calc(100% - 6rem)' : '6.5rem' }}>
        {chatMessages.map((message, index) => (
          <p key={index} className="text-lg  text-gray-900">
            {message.text}
          </p>
        ))}
      </div>

      {/* Chart visibility button*/}
      <div className={`rounded-lg h-1.25rem pl-12 pr-12 w-7/8 bg-gray-900`}>
        <button onClick={toggleMessagesVisibility} className="bg-darkgrey pl-12 pr-12 text-black text-xs rounded">
          {isMessagesVisible ? ' ^ ^ ^ ' : ' v v v '}
        </button>
      </div>

      {/* Chat input*/}
      <div className="chat-bar h-1/9 border-2 border-gray-900 rounded-lg  mb-2  pl-6 py-2  bg-olive">
        <input
          type="text"
          value={chatQuery}
          onChange={(e) => setChatQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="border p-2 mr-2 w-4/5"/>
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

export default ChatComponent;
