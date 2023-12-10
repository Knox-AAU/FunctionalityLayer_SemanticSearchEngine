import React, { useState } from 'react';
// import { handleSortByDate, handleSortByRelevance } from '../Components/SortingLogic';

type SearchBarComponentProps = {
    onSearch: (searchParams: { query: string, publishedAfter: string, publishedBefore: string }) => void;
    onBertSearch: (searchParams: { query: string, publishedAfter: string, publishedBefore: string }) => void;
    onSortByDate: () => void;
    onSortByRelevance: () => void;
    sortOrder: 'ascending' | 'descending';
};

const SearchBarComponent: React.FC<SearchBarComponentProps> = ({ onSearch, onBertSearch, onSortByDate, onSortByRelevance, sortOrder }) => {
    const [query, setQuery] = useState('');
    const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
    const [searchOption, setSearchOption] = useState('Standardsearch');
    const [language, setLanguage] = useState('autodetect');



    const handleSortByDate = () => {
        onSortByDate(); // Call the passed function without arguments
    };

    const handleSortByRelevance = () => {
        onSortByRelevance(); // Call the passed function without arguments
    };

    const toggleAdvancedOptions = () => {
        setShowAdvancedOptions(!showAdvancedOptions);
    };
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleBertSearch();
        }
    };
    const [publishedAfter, setPublishedAfter] = useState('');
    const [publishedBefore, setPublishedBefore] = useState('');

    const handleSearch = () => {
        if (query) {
            onSearch({ query, publishedAfter, publishedBefore });
        }
    };
    const handleBertSearch = () => {
        if (query) {
            onBertSearch({ query, publishedAfter, publishedBefore });
        }
    };
    return (
        <div className="search-bar ml-8 border-2 border-gray-900 rounded-lg mb-2 w-4/5 pl-6 py-2  bg-darkgrey">
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="border p-2 mr-2 w-4/5"
            />
            <button onClick={handleSearch} className="bg-blue-500 text-white p-2 rounded mr-2">
                Search
            </button>
            <button onClick={handleBertSearch} className="bg-blue-500 text-white p-2 rounded mr-2">
                No LlamaSearch
            </button>
            <button onClick={onSortByDate} className="bg-rebeccapurple text-white pl-2 pr-2 rounded mr-2 mt-0.5 h-8">
                Sort by Date {sortOrder === 'ascending' ? '↑' : '↓'}
            </button>
            <button onClick={handleSortByRelevance} className="bg-rebeccapurple text-white pl-2 pr-2 rounded mr-2 mt-0.5 h-8">Sort by Relevance</button>

            <button onClick={toggleAdvancedOptions} className="bg-gray-500 text-white p-2 rounded ml-2">
                Advanced
            </button>

            {showAdvancedOptions && (
                <div className="advanced-options mt-2 flex flex-wrap">
                    {/* Radio Buttons */}

                    <div className="flex items-center mr-4">
                        <label>Author:</label>
                        <input
                            value="Bruce Wayne"
                            type="text"
                            checked={searchOption === 'Authorsearch'}
                            onChange={(e) => setSearchOption(e.target.value)}
                            className="mr-1"
                        />
                    </div>
                    <div className="flex items-center mr-4">
                        <input
                            type="radio"
                            value="Titlesearch"
                            checked={searchOption === 'Titlesearch'}
                            onChange={(e) => setSearchOption(e.target.value)}
                            className="mr-1"
                        />
                        <label>Search titles only</label>
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

                    <input
                        type="date"
                        value={publishedAfter}
                        onChange={(e) => setPublishedAfter(e.target.value)}
                        className="border p-2 mr-2"
                    />
                    <input
                        type="date"
                        value={publishedBefore}
                        onChange={(e) => setPublishedBefore(e.target.value)}
                        className="border p-2 mr-2"
                    />

                </div>
            )}
        </div>
    );
}

export default SearchBarComponent;
