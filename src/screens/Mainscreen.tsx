import React, { useState, useEffect } from 'react';
import ChatOutputComponent from '../Components/ChatOutputComponent';
import SearchBarComponent from '../Components/SearchBarComponent';
import SearchResultComponent from '../Components/SearchResultComponent';

export type PdfData = {
    url: string;
    title: string;
    author: string;
    date: string;
    relevance: number;
    // ... any other metadata fields
};
export type PdfObjects = PdfData[];

const Mainscreen = () => {
    const [PdfObjects, setPdfObjects] = useState<PdfData[]>([]); // Change the type to Pdfdata[]
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

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
                
            }

            const data: PdfData[] = await response.json(); // Use Pdfdata type
            setPdfObjects(data);
        } catch (error) {
            setError('Failed to fetch from the API');
        } finally {
            setLoading(false);
        }
    };

    const handleSortByDate = () => {
        // Sort PdfObjects by date in ascending order (modify the sort logic as needed)
        const sortedPdfObjects = [...PdfObjects].sort((a, b) => {
            // Assuming your date is in ISO format, you can parse and compare them
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateA.getTime() - dateB.getTime(); // Use getTime() to compare dates
        });

        setPdfObjects(sortedPdfObjects);
    };

    useEffect(() => {
        // Initial load, you can call fetchSearchResults with a default query here if needed.
    }, []);

    return (
        <div className="main-container h-screen mx-auto bg-gray-900">
            <div className="title-line text-xl font-bold p-4 text-white pl-4">KNOX Search and Chat</div>
            <ChatOutputComponent />
            <SearchBarComponent onSearch={fetchSearchResults} onSortByDate={handleSortByDate} />
            {loading && <div>Loading...</div>}
            {error && <div className="text-red-500">{error}</div>}
            {!loading && !error && <SearchResultComponent PdfObjects={PdfObjects} />}
    
        </div>
    );
}

export default Mainscreen;
