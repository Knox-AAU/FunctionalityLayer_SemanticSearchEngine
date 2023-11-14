import React, { useState } from 'react';


type SearchBarComponentProps = {
    onSearch: (query: string) => void;
};

const SearchBarComponent: React.FC<SearchBarComponentProps> = ({ onSearch }) => {
    const [query, setQuery] = useState('');
    const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
    const [searchOption, setSearchOption] = useState('');
    const [language, setLanguage] = useState('');

    const handleSearch = () => {
        if (query) {
            onSearch(query); // Call the passed function with the query
        }
    };



    const toggleAdvancedOptions = () => {
        setShowAdvancedOptions(!showAdvancedOptions);
    };

    return (
        <div className="search-bar ml-8 border-2 border-gray-900 rounded-lg  mb-2 w-4/5 pl-6 py-2  bg-darkgrey">
            <input 
                type="text" 
                value={query} 
                onChange={(e) => setQuery(e.target.value)} 
                className="border p-2 mr-2 w-4/5"
            />
            <button onClick={handleSearch} className="bg-blue-500 text-white p-2 rounded">
                Search
            </button>
            <button onClick={toggleAdvancedOptions} className="bg-gray-500 text-white p-2 rounded ml-2">
                Advanced
            </button>

            {showAdvancedOptions && (
                <div className="advanced-options mt-2 flex flex-wrap">
                    {/* Radio Buttons */}
                    <div className="flex items-center mr-4">
                        <input 
                            type="radio" 
                            value="authors" 
                            checked={searchOption === 'authors'} 
                            onChange={(e) => setSearchOption(e.target.value)} 
                            className="mr-1"
                        />
                        <label>Search for Authors</label>
                    </div>
                    <div className="flex items-center mr-4">
                        <input 
                            type="radio" 
                            value="region" 
                            checked={searchOption === 'region'} 
                            onChange={(e) => setSearchOption(e.target.value)} 
                            className="mr-1"
                        />
                        <label>Search for Region</label>
                    </div>

                    {/* Dropdown Menu for Language Selection */}
                    <div className="flex items-center mr-4">
                        <label className="mr-2">Language:</label>
                        <select 
                            value={language} 
                            onChange={(e) => setLanguage(e.target.value)} 
                            className="border p-1 rounded"
                        >
                            <option value="">Select Language</option>
                            <option value="danish">Danish</option>
                            <option value="english">English</option>
                        </select>
                    </div>

                    {/* Additional button if needed */}
                    <button className="bg-blue-500 text-white p-2 rounded mr-2 mt-2">Option 3</button>
                </div>
            )}
        </div>
    );
}

export default SearchBarComponent;
