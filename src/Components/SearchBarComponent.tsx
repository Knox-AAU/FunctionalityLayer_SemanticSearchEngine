import React, { useState } from 'react';
import { handleSortByDate, handleSortByRelevance } from '../Components/SortingLogic';

type SearchBarComponentProps = {
    onSearch: (query: string) => void; // Define the type for onSearch prop
    onSortByDate: () => void; // Callback function for sorting by date
    onSortByRelevance: () => void; // Callback function for sorting by relevance
};

const SearchBarComponent: React.FC<SearchBarComponentProps> = ({ onSearch, onSortByDate, onSortByRelevance }) => {
    const [query, setQuery] = useState('');
    const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
    const [searchOption, setSearchOption] = useState('Standardsearch');
    const [language, setLanguage] = useState('autodetect');

    const handleSearch = () => {
        if (query) {
            onSearch(query); // Call the passed function with the query
        }
    };

    const handleSortByDate = () => {
        onSortByDate(); // Call the passed function without arguments
    };

    const handleSortByRelevance = () => {
        onSortByRelevance(); // Call the passed function without arguments
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
                            value="Authorsearch" 
                            checked={searchOption === 'Authorsearch'} 
                            onChange={(e) => setSearchOption(e.target.value)} 
                            className="mr-1"
                        />
                        <label>Author Search</label>
                    </div>
                    <div className="flex items-center mr-4">
                        <input 
                            type="radio" 
                            value="Titlesearch" 
                            checked={searchOption === 'Titlesearch'} 
                            onChange={(e) => setSearchOption(e.target.value)} 
                            className="mr-1"
                        />
                        <label>Title Search</label>
                    </div>
                    <div className="flex items-center mr-4">
                        <input 
                            type="radio" 
                            value="Standardsearch" 
                            checked={searchOption === 'Standardsearch'} 
                            onChange={(e) => setSearchOption(e.target.value)} 
                            className="mr-1"
                        />
                        <label>Normal KNOX search</label>
                    </div>

                    {/* Dropdown Menu for Language Selection */}
                    <div className="flex items-center mr-4">
                        <label className="mr-2">Language:</label>
                        <select 
                            value={language} 
                            onChange={(e) => setLanguage(e.target.value)} 
                            className="border p-1 rounded"
                        >
                            <option value="danish">Danish</option>
                            <option value="english">English</option>
                            <option value="autodetect">auto detect</option>
                        </select>
                    </div>
                    {/* implement rising and falling options for datesort */}
                    <button onClick={handleSortByDate} className="bg-rebeccapurple text-white pl-2 pr-2 rounded mr-2 mt-0.5 h-8">Sort by Date</button> 
                    <button onClick={handleSortByRelevance} className="bg-rebeccapurple text-white pl-2 pr-2 rounded mr-2 mt-0.5 h-8">Sort by Relevance</button>

                    <div className="search-bar p-4">
                    {/* ...other elements */}

                    {/* ...other elements */}
                </div>
                </div>
            )}
        </div>
    );
}

export default SearchBarComponent;
