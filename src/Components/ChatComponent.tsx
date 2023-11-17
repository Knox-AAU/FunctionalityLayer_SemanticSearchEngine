import React, { useState } from 'react';
import ChatOutputComponent from './ChatOutputComponent';
import ChatInputComponent from './ChatInputComponent';
import ToggleVisibilityButton from './ToggleVisibilityButton';

type ChatComponentProps = {
  chatMessages: ChatMessage[];
  onChat: (query: string) => void;
};

type ChatMessage = {
  text: string;
  sender: 'user' | 'backend';
};

const ChatComponent: React.FC<ChatComponentProps> = ({ chatMessages, onChat }) => {
  const [isMessagesVisible, setIsMessagesVisible] = useState(true);

  const toggleMessagesVisibility = () => {
    setIsMessagesVisible(!isMessagesVisible);
  };

  return (
    <div>
    <div className="mb-2 rounded-lg ml-8 w-4/5 bg-gray-900" style={{ maxHeight: isMessagesVisible ? '100%' : '12rem' }}>
      <ChatOutputComponent chatMessages={chatMessages} isMessagesVisible={isMessagesVisible} />
    </div>
    <div className="mb-2 rounded-lg ml-8 w-4/5 bg-gray-900">
      <ToggleVisibilityButton isMessagesVisible={isMessagesVisible} toggleMessagesVisibility={toggleMessagesVisibility} />
      <ChatInputComponent onChat={onChat} />
      </div></div>
  );
};

export default ChatComponent;
