import React, { useState, useEffect, useCallback } from 'react';
import SearchBarComponent from '../Components/SearchBarComponent';
import {
  sortPdfObjectsByDate,
  sortPdfObjectsByRelevance,
} from '../TypesAndLogic/SortingLogic2';
import ChatComponent from '../Components/ChatComponent';
import SearchResultComponent from '../Components/SearchResultComponent';
import { dummyData } from '../TypesAndLogic/dummydata';
import { useNavigate } from 'react-router-dom';
import { pdfObjectArray } from '../TypesAndLogic/Types';
import { pdfObject } from '../TypesAndLogic/Types';

const Mainscreen = () => {
  let navigate = useNavigate();
  const routeChange = (path: string) => {
    navigate(path);
  };
  const [PdfObjects, setPdfObjects] = useState<pdfObject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'ascending' | 'descending'>(
    'ascending'
  );

  const handleSortByDate = useCallback(() => {
    const sortedPdfObjects = sortPdfObjectsByDate(PdfObjects, sortOrder);
    setPdfObjects(sortedPdfObjects);
    setSortOrder((prevSortOrder: string) =>
      prevSortOrder === 'ascending' ? 'descending' : 'ascending'
    );
  }, [PdfObjects, sortOrder]);

  const handleSortByRelevance = useCallback(() => {
    const sortedPdfObjects = sortPdfObjectsByRelevance(PdfObjects);
    setPdfObjects(sortedPdfObjects);
  }, [PdfObjects]);

  const handleSearch = async (searchParams: {
    query: string;
    publishedAfter?: string;
    publishedBefore?: string;
    author?: string;
    titleSearch?: boolean;
    bmBertOrBoth: string;
  }) => {
    setLoading(true); //makes it so that the function can only run one at a time
    setError(null);

    const options = {
      url: '/search',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(searchParams),
      timeout: 720000,
    };

    fetch(options.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        //'Keep-Alive': 'timeout=720, max=1',
      },
      body: JSON.stringify(searchParams),
    })
      .then((response) => response.json())
      .then((data) => {
        //console.log(JSON.stringify({ query: searchParams }));
        //console.log('Changing Data');
        //console.log(JSON.stringify(data));
        //"URL": doc.get("url"), "pdfPath": doc.get("pdfPath"), "Title": doc.get("title"), "Score": score
        setPdfObjects(
          data.map((element: any) => {
            //console.log("element" + JSON.stringify(element))
            return {
              url: element.URL,
              date: element.TimeStamp,
              relevance: element.Score,
              title: element.Title,
              PDFPath: element.pdfPath,
              author: element.Author
            };
          })
        );
        setLoading(false);
      })
      .catch((err) => {
        alert(err);
        console.log(err);
      });
  };
  const handleBertSearch = async (searchParams: {
    query: string;
    publishedAfter?: string;
    publishedBefore?: string;
    author?: string;
    titleSearch?: boolean;
    bmBertOrBoth: string;
  }) => {
    setLoading(true);
    setError(null);

    const options = {
      url: '/bertSearch',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(searchParams),
      timeout: 720000,
    };

    fetch(options.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        //'Keep-Alive': 'timeout=720, max=1',
      },
      body: JSON.stringify(searchParams),
    })
      .then((response) => response.json())
      .then((data) => {
        //console.log(JSON.stringify({ query: searchParams }));
        //console.log('Changing Data');
        //console.log(JSON.stringify(data));
        //"URL": doc.get("url"), "pdfPath": doc.get("pdfPath"), "Title": doc.get("title"), "Score": score
        setPdfObjects(
          data.map((element: any) => {
            //console.log("element" + JSON.stringify(element))
            return {
              url: element.URL,
              date: element.TimeStamp,
              relevance: element.Score,
              title: element.Title,
              PDFPath: element.pdfPath,
              author: element.Author
            };
          })
        );
        setLoading(false);
      })
      .catch((err) => {
        alert(err);
        console.log(err);
      });
  };

  const handleChat = async (query: string) => {
    // Log the chat request details
    console.log(`Chat Request: ${query}`);

    // Post the user's query in the chat
    setChatMessages((prevMessages) => [
      ...prevMessages,
      { text: query, sender: 'user' },
    ]);

    try {
      // Send the user's query to the chatbot backend
      const response = await fetch('/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error('Failed to get a response from the chatbot backend');
      }

      // Example: Assuming the backend responds with a JSON object containing the bot's reply
      const responseData = await response.json();

      // Post the response from the backend in the chat
      setChatMessages((prevMessages) => [
        ...prevMessages,
        { text: responseData.response, sender: 'backend' },
      ]);
    } catch (error) {
      console.error('Error during chat:', error);
      // Handle errors, e.g., display an error message in the chat

      // If there is an error or no response from the backend, post a dummy response
      setChatMessages((prevMessages) => [
        ...prevMessages,
        {
          text: "Sorry, I couldn't understand that, or maybe there is no connection to the backend. Please try again.",
          sender: 'backend',
        },
      ]);
    }
  };

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    // Initial load
  }, []);

  return (
    <div className="main-container h-screen mx-auto overflow-y-auto bg-gray-900">
      <button onClick={() => routeChange('/admin')}>Admin</button>
      <div className="title-line text-xl font-bold p-4 text-white pl-4">
        KNOX Search and Chat
      </div>
      <div className="Chatcomponent">
        <ChatComponent chatMessages={chatMessages} onChat={handleChat} />
      </div>

      <div className="Searchcomponent">
        <SearchBarComponent
          onSearch={(searchParams) => handleSearch(searchParams)}
          onBertSearch={(searchParams) => handleBertSearch(searchParams)}
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
