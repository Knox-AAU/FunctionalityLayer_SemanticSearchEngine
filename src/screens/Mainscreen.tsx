// Mainscreen.tsx
import React from 'react';
import ChatOutputComponent from '../Components/ChatOutputComponent';
import SearchBarComponent from '../Components/SearchBarComponent'; // Adjust the path as necessary
import SearchResultComponent from '../Components/SearchResultComponent'; // Adjust the path as necessary

const Mainscreen = () => {
    return ( 
        <>
            <div className="title-line text-xl font-bold p-4">KNOX Search and Chat</div>
            <ChatOutputComponent />
            <SearchBarComponent />
            <SearchResultComponent />
        </>
    );
}

export default Mainscreen;
