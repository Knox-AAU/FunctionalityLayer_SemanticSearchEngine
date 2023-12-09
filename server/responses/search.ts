import { IncomingMessage as Request, ServerResponse as Response } from 'http';
import { determineMimeType, getPostData } from '../serverHelpers';
import { errorResponse } from '../responseHandlers';
import { llamaUrl } from '../../app';
import { TimeoutWrapper } from '../timeoutExtender';
import { Llama_Analyze } from './LlamaAnalyzer';

type queryRequest = {
    query: string,
}

export function KNOXSearch(req: Request, res: Response){
   // Step 1: Extract data from the request body
   getPostData(req)
   .then (async(data) => {
       console.log("Data: " + JSON.stringify(data));

       // Step 2: Format the data as per the Llama API request structure
       const formattedData = data as queryRequest;

    // returns an array: subject, object, predicate
    llamaresult: String[3] = Llama_Analyze(Request.query)
    
    const nodeArray:string[]  = fetch_TripleFromGraph(subjectWord, objectWord, predicateWord);



}