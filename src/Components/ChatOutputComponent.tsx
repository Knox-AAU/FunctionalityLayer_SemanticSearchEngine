import React, { useEffect, useRef } from 'react';

type ChatOutputComponentProps = {
  chatMessages: ChatMessage[];
  isMessagesVisible: boolean;
};

type ChatMessage = {
  text: string;
  sender: 'user' | 'backend';
};

const ChatOutputComponent: React.FC<ChatOutputComponentProps> = ({
  chatMessages,
  isMessagesVisible,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const maxHeightWhenHidden = '10vh'; // Adjust this value as needed
  const maxHeight = isMessagesVisible ? '65vh' : maxHeightWhenHidden;

  // Function to scroll to the bottom of the chat log
  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  };

  // Scroll to the bottom whenever the chat messages change
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  return (
    <div
      ref={containerRef}
      className={`rounded-lg overflow-y-auto pl-4 w-7/8 bg-olive`}
      style={{ maxHeight }}
    >
      {chatMessages.map((message, index) => (
        <p key={index} className="text-lg text-gray-900">
          {message.text}
        </p>
      ))}
    </div>
  );
};

export default ChatOutputComponent;
