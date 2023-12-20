import React from 'react';
// import { PdfObjectArray } from '../TypesAndLogic/Types';
import { pdfObject } from '../TypesAndLogic/Types';

const SearchResultComponent = ({ PdfObjects }: { PdfObjects: pdfObject[] }) => {
    return (
        <div className="search-results border-2 border-blue-900 rounded-lg overflow-y-auto h-1/3 p-4 w-4/5 ml-8 pl-3 bg-gray-300">
            {PdfObjects.map((PdfData) => {
                const date = new Date(parseInt(PdfData.date));
                const year = date.getFullYear();
                const month = date.getMonth() + 1; // Month is zero-based, so add 1 to get the actual month (1-12)
                const day = date.getDate();
                const hours = date.getHours();
                const minutes = date.getMinutes();
                const seconds = date.getSeconds();
                const dateString = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                console.log(PdfData);
                return (
                    <div key={PdfData.url} className="mb-4">
                        <p className="text-sm text-black">
                            Date: {dateString} | Author: {PdfData.author}
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
                )
            })}
        </div>
    );
}


export default SearchResultComponent;
