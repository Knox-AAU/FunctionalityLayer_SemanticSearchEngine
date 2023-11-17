import React, { useState, useEffect } from 'react';
import ChatComponent from '../Components/ChatComponent';
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
      console.log(`Search Request URL: http://search.aau.dk/api/search`);
      console.log(`Search Request Method: POST`);
      console.log(`Search Request Body: ${JSON.stringify({ query })}`);

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

  const handleChat = async (query: string) => {
    // Log the chat request details
    console.log(`Chat Request: ${query}`);

    // Send the chat query to the backend (replace this with actual backend integration)
    // ...

    // Post the user's query in the chat
    setChatMessages((prevMessages) => [...prevMessages, { text: query, sender: 'user' }]);

    // Receive and post the response from the backend (replace this with actual backend integration)
    // ...

    // Example response from the backend (replace this with actual backend response)
    const response = 'This is a response from the backend.';

    // Post the response in the chat
    setChatMessages((prevMessages) => [...prevMessages, { text: response, sender: 'backend' }]);
  };

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    // Initial load, you can call fetchSearchResults with a default query here if needed.
  }, []);

  return (
    <div className="main-container h-screen mx-auto overflow-y-auto bg-gray-900">
      <div className="title-line text-xl font-bold p-4 text-white pl-4">KNOX Search and Chat</div>
      <ChatComponent chatMessages={chatMessages} onChat={handleChat} />
      <SearchBarComponent
        onSearch={fetchSearchResults}
        onSortByDate={() => handleSortByDate(PdfObjects, setPdfObjects)}
        onSortByRelevance={() => handleSortByRelevance(PdfObjects, setPdfObjects)}
      />
      {loading && <div>Loading...</div>}
      {!loading && <SearchResultComponent PdfObjects={PdfObjects} />}
    </div>
  );
};

export default Mainscreen;
type ChatComponentProps = {
    chatMessages: ChatMessage[];
    onChat: (query: string) => void;
  };
type ChatMessage = {
  text: string;
  sender: 'user' | 'backend';
};
