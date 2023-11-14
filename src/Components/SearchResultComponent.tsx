import React from 'react';

// Define a type for the component props
type SearchResultComponentProps = {
    pdfUrls: string[];
};

const SearchResultComponent: React.FC<SearchResultComponentProps> = ({ pdfUrls }) => {
    return (
        <div className="search-results border-2 border-blue-900 rounded-lg overflow-y-auto h-1/3 p-4 w-4/5 ml-8 pl-3 bg-gray-500">
            {pdfUrls.map((url, index) => (
                <a key={index} href={url} target="_blank" rel="noopener noreferrer">
                    View PDF {index + 1}
                </a>
                // Or using an <iframe> or <object> tag for direct embedding
            ))}
        </div>
    );
}

export default SearchResultComponent;
