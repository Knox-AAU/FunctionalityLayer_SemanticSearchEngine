import React from 'react';

// Props for the ToggleVisibilityButton component.
type ToggleVisibilityButtonProps = {
   isMessagesVisible: boolean;
  /** Function to toggle the visibility of messages. */
  toggleMessagesVisibility: () => void;
};


 /**Button component to toggle the visibility of messages.
 * {ToggleVisibilityButtonProps} - Props for the component.
 * returns {JSX.Element} - The rendered component. */
const ToggleVisibilityButton: React.FC<ToggleVisibilityButtonProps> = ({ isMessagesVisible, toggleMessagesVisibility }) => {
  return (
    <div className="rounded-lg h-1.25rem pl-12 pr-12 w-7/8 bg-gray-900">
      {/* Button to toggle visibility with a conditional icon */}
      <button onClick={toggleMessagesVisibility} className="bg-darkgrey pl-12 pr-12 text-black text-xs rounded">
        {isMessagesVisible ? ' ^ ^ ^ ' : ' v v v '} {/* the "icon" changes from vvv to ^^^ */}
      </button>
    </div>
  );
};
export default ToggleVisibilityButton;
