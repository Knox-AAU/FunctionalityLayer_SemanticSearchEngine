import React, { useState, useEffect, useCallback } from 'react';
import SearchBarComponent from '../Components/SearchBarComponent';
import { sortPdfObjectsByDate, sortPdfObjectsByRelevance } from '../TypesAndLogic/SortingLogic2';
import ChatComponent from '../Components/ChatComponent';
import SearchResultComponent from '../Components/SearchResultComponent';
import { dummyData } from '../TypesAndLogic/dummydata';

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
  const [sortOrder, setSortOrder] = useState<'ascending' | 'descending'>('ascending');

  const handleSortByDate = useCallback(() => {
    const sortedPdfObjects = sortPdfObjectsByDate(PdfObjects, sortOrder);
    setPdfObjects(sortedPdfObjects);
    setSortOrder((prevSortOrder) =>
      prevSortOrder === 'ascending' ? 'descending' : 'ascending'
    );
  }, [PdfObjects, sortOrder]);

  const handleSortByRelevance = useCallback(() => {
    const sortedPdfObjects = sortPdfObjectsByRelevance(PdfObjects);
    setPdfObjects(sortedPdfObjects);
  }, [PdfObjects]);

  const fetchSearchResults = async (searchParams: {
    query: string;
    publishedAfter?: string;
    publishedBefore?: string;
    author?: string;
    titleSearch?: boolean;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://search.aau.dk/api/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchParams),
      });

      if (!response.ok) {
        setError('Failed to fetch from the API');
        setPdfObjects(dummyData);
      } else {
        const data: PdfData[] = await response.json();
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
    console.log(`Chat Request: ${query}`);
    // chat handling logic
  };

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    // Initial load
  }, []);

  return (
    <div className="main-container h-screen mx-auto overflow-y-auto bg-gray-900">
      <div className="title-line text-xl font-bold p-4 text-white pl-4">KNOX Search and Chat</div>
      <div className='Chatcomponent'>
        <ChatComponent chatMessages={chatMessages} onChat={handleChat} />
      </div>

      <div className='Searchcomponent'>
        <SearchBarComponent
          onSearch={(searchParams) => fetchSearchResults(searchParams)}
          onSortByDate={handleSortByDate}
          onSortByRelevance={handleSortByRelevance}
          sortOrder={sortOrder}
        />
        {loading && <div>Loading...</div>}
        {!loading && <SearchResultComponent PdfObjects={PdfObjects} />}
      </div>
    </div>
  );
};

export default Mainscreen;

type ChatMessage = {
  text: string;
  sender: 'user' | 'backend';
};
