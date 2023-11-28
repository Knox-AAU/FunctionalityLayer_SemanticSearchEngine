import React from 'react';

type ToggleVisibilityButtonProps = {
  isMessagesVisible: boolean;
  toggleMessagesVisibility: () => void;
};

const ToggleVisibilityButton: React.FC<ToggleVisibilityButtonProps> = ({ isMessagesVisible, toggleMessagesVisibility }) => {
  return (
    <div className="rounded-lg h-1.25rem pl-12 pr-12 w-7/8 bg-gray-900">
      <button onClick={toggleMessagesVisibility} className="bg-darkgrey pl-12 pr-12 text-black text-xs rounded">
        {isMessagesVisible ? ' ^ ^ ^ ' : ' v v v '}
      </button>
    </div>
  );
};

export default ToggleVisibilityButton;
