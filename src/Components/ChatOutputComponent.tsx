import React from 'react';

type ChatOutputComponentProps = {
  chatMessages: ChatMessage[];
  isMessagesVisible: boolean;
};

type ChatMessage = {
  text: string;
  sender: 'user' | 'backend';
};

const ChatOutputComponent: React.FC<ChatOutputComponentProps> = ({ chatMessages, isMessagesVisible }) => {
    const maxHeightWhenHidden = '10vh'; // Adjust this value as needed
    const maxHeight = isMessagesVisible ? '65vh' : maxHeightWhenHidden;
  
    return (
      <div className={`rounded-lg overflow-y-auto pl-4 w-7/8 bg-olive`} style={{ maxHeight }}>
        {chatMessages.map((message, index) => (
          <p key={index} className="text-lg text-gray-900">
            {message.text}
          </p>
        ))}
      </div>
    );
  };

export default ChatOutputComponent;
