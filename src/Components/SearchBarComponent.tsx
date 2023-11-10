import React, { useState } from 'react';

const SearchBarComponent = () => {
    const [query, setQuery] = useState('');

    const handleSearch = () => {
        // Implement search functionality
        console.log('Searching for:', query);
    }

    return (
        <div className="search-bar mb-4">
            <input 
                type="text" 
                value={query} 
                onChange={(e) => setQuery(e.target.value)} 
                className="border p-2 mr-2"
            />
            <button onClick={handleSearch} className="bg-blue-500 text-white p-2 rounded">
                Search
            </button>
        </div>
    );
}

export default SearchBarComponent;
