import React, { useState, useEffect } from 'react';
import ChatOutputComponent from '../Components/ChatOutputComponent';
import SearchBarComponent from '../Components/SearchBarComponent';
import SearchResultComponent from '../Components/SearchResultComponent';

const Mainscreen = () => {
    const [pdfObjects, setPdfObjects] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

            const data = await response.json(); // an array of URLs to PDF files
            setPdfObjects(data); // Update the state with the fetched data
        } catch (error) {
            setError('Failed to fetch from the API');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Initial load, you can call fetchSearchResults with a default query here if needed.
    }, []);

    return (
        <div className="main-container h-screen mx-auto bg-gray-900">
            <div className="title-line text-xl font-bold p-4 text-white pl-4">KNOX Search and Chat</div>
            <ChatOutputComponent />
            <SearchBarComponent onSearch={fetchSearchResults} />
            {loading && <div>Loading...</div>}
            {error && <div className="text-red-500">{error}</div>}
            {!loading && !error && <SearchResultComponent pdfUrls={pdfObjects} />}
        </div>
    );
}

export default Mainscreen;
