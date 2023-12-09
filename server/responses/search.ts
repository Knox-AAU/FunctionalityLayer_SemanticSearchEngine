import { IncomingMessage as Request, ServerResponse as Response } from 'http';
import { determineMimeType, getPostData } from '../serverHelpers';
import { errorResponse } from '../responseHandlers';
import { llamaUrl } from '../../app';
import { TimeoutWrapper } from '../timeoutExtender';
import { Llama_Analyze } from './LlamaAnalyzer';
import { fetch_TripleFromGraph } from './knowledgeGraphFetcher';
import { FetchPdfArray } from './fetchPDFFromDatabase';
type queryRequest = {
    query: string,
}
const targetContainerHostname = 'ranking'; //  container name

export const url = `http://${targetContainerHostname}:6969/`; //  portNumber and path 
export function KNOXSearch(req: Request, res: Response){
   // Extract data from the request body
   getPostData(req)  //Returns promise that retrieves post data in chunks
   .then (async(data) => {
        console.log("Data: " + JSON.stringify(data));

        //Format the data as per the Llama API request structure
        const formattedData = data as queryRequest;

        // Llama_Analyze returns an array:[subject, object, predicate]
        const llamaresult: string[] = await Llama_Analyze(formattedData.query);   
        const subjectWord: string =llamaresult[0];
        const objectWord: string =llamaresult[1];
        const predicateWord: string =llamaresult[2];
        const nodeArray:string[]  = await fetch_TripleFromGraph(subjectWord, objectWord, predicateWord);
       
        //use nodeArray to get files from the Ranking module:
        console.log("sending - " + JSON.stringify(nodeArray) + "- to ranking script")
        await FetchPdfArray(url, nodeArray, res)
    })
   .catch((err) => {
    errorResponse(res, 503, `searcherror 4: Could not extract data from the request body. ${err.toString()}`);
    });
        
}