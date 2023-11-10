import React from 'react';

const SearchResultComponent = () => {
    // Example search results
    const results = ["Result 1", "Result 2"];

    return (
        <div className="search-results border p-4">
            {results.map((result, index) => (
                <p key={index}>{result}</p>
            ))}
        </div>
    );
}

export default SearchResultComponent;
