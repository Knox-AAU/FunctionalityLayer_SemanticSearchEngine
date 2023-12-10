import React from 'react';
// import { PdfObjectArray } from '../TypesAndLogic/Types';
import { pdfObject } from  '../TypesAndLogic/Types';

const SearchResultComponent = ({ PdfObjects }: { PdfObjects: pdfObject[] }) => {

    return (
        <div className="search-results border-2 border-blue-900 rounded-lg overflow-y-auto h-1/3 p-4 w-4/5 ml-8 pl-3 bg-gray-300">
            {PdfObjects.map((PdfData) => (
                <div key={PdfData.url} className="mb-4">
                    <p className="text-sm text-black">
                        Date: {PdfData.date} | Author: {PdfData.author}
                    </p>
                    <a
                        href={PdfData.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-darkblue hover:underline text-xl"
                    >
                        {PdfData.title}
                    </a>
                    <span className="text-gray-400 ml-2">Relevance: {PdfData.relevance}</span>
                </div>
            ))}
        </div>
    );
}


export default SearchResultComponent;
