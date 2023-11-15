import React, { useState, useEffect } from 'react';
import ChatOutputComponent from '../Components/ChatOutputComponent';
import SearchBarComponent from '../Components/SearchBarComponent';
import SearchResultComponent from '../Components/SearchResultComponent';

import { dummyData } from '../Components/dummydata'; 
import { handleSortByDate, handleSortByRelevance } from '../Components/SortingLogic';


export type PdfData = {
    url: string;
    title: string;
    author: string;
    date: string;
    relevance: number;
};
export type PdfObjects = PdfData[];

const Mainscreen = () => {
    const [PdfObjects, setPdfObjects] = useState<PdfData[]>([]); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sortByDate, setSortByDate] = useState(false);


    const fetchSearchResults = async (query: string) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`http://search.aau.dk/api/search`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query })
            });

            // Log the request details
            console.log(`Request URL: http://search.aau.dk/api/search`);
            console.log(`Request Method: POST`);
            console.log(`Request Body: ${JSON.stringify({ query })}`);


            if (!response.ok) {
                setError('Failed to fetch from the API');
                setPdfObjects(dummyData);
            } else {
                const data: PdfData[] = await response.json(); // Use Pdfdata type
                setPdfObjects(data);
            }
        } catch (error) {
            setError('Failed to fetch from the API');
            setPdfObjects(dummyData);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        // Initial load, call fetchSearchResults with a default query here if needed.
    }, []);

    return (
    <div className="main-container h-screen mx-auto bg-gray-900">
        <div className="title-line text-xl font-bold p-4 text-white pl-4">KNOX Search and Chat</div>
        <ChatOutputComponent />
        <SearchBarComponent
            onSearch={fetchSearchResults}
            onSortByDate={() => handleSortByDate(PdfObjects, setPdfObjects)} 
            onSortByRelevance={() => handleSortByRelevance(PdfObjects, setPdfObjects)}
        />
         {loading && <div>Loading...</div>}
            {!loading && <SearchResultComponent PdfObjects={PdfObjects} />}
        </div>
);

}

export default Mainscreen;
