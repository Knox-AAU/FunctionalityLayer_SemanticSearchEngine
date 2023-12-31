import { IncomingMessage as Request, ServerResponse as Response } from 'http';
import { determineMimeType, getPostData } from '../serverHelpers';
import { errorResponse } from '../responseHandlers';
import { llamaUrl } from '../../app';
import { Llama_Analyze } from './LlamaAnalyzer';
import { fetch_TripleFromGraph } from './knowledgeGraphFetcher';
type queryRequest = {
	query: string;
	publishedAfter: string;
	publishedBefore: string;
};
const targetContainerHostname = 'ranking'; //  container name

export const url = `http://${targetContainerHostname}:6969/`; //  portNumber and path

export function KNOXSearch(req: Request, res: Response) { //response of errors
	// Extract data from the request body
	getPostData(req) //Returns promise that retrieves post data in chunks
		.then(async (data: any) => {
			console.log('Data: ' + JSON.stringify(data));

			//Format the data as per the Llama API request structure
			const formattedData = data as queryRequest;
			// Llama_Analyze sends requests to the Llama API server. returns an array:[subject, object, predicate]
			const llamaresult: string[] | null = await Llama_Analyze(
				res,
				formattedData.query
			);
			if (!llamaresult) return;			
			const subjectWord: string = llamaresult[0];
			const objectWord: string = llamaresult[1];
			const predicateWord: string = llamaresult[2];

			// Send request to KnowledgeGraph API
			const nodeArray: string[] | null = await fetch_TripleFromGraph(
				res,
				subjectWord,
				objectWord,
				predicateWord
			);
			if (!nodeArray) return;
			//use nodeArray to get files from the Ranking module:
			console.log('nodeArray' + nodeArray);
			bertSearch(req, res, { query: nodeArray.join(' ') });
		});
}

// res: response handles errors
export function bertSearchDecorator(req: Request, res: Response) {
	getPostData(req)
		.then((data: any) => {
			bertSearch(req, res, data);
		})
		.catch((err) => {
			errorResponse(
				res,
				503,
				`searcherror 4: Could not extract data from the request body. ${err.toString()}`
			);
		});
}


// res: response handles errors
//  Handles BERT-based search by sending a POST request to a specified URL with query data.
export function bertSearch(req: Request, res: Response, data: any) {
	fetch(url + 'query', {
		method: 'POST',
		body: JSON.stringify(data),
	})
		.then(async (response) => { //
			if (response.ok) {
				response
					.json()
					.then((data: any) => {
						res.statusCode = 200;
						// Set the Content-Type header based on the determined MIME type
						res.setHeader('Content-Type', determineMimeType('.json')); // MIME -> Multipurpose Internet Mail Extensions
						// Write the response data as a JSON string to the response
						res.write(JSON.stringify(data));
						res.end('\n');
					})
					.catch((err) => {
						errorResponse(
							res,
							500,
							`searcherror 1: Failed to parse response data. ${err.toString()}`
						);
					});
			} else {
				console.log('Err');
				errorResponse(
					res,
					response.status,
					`searcherror 2: Ranker-script returned an error status (${response.status}).`
				);
			}
		})
		.catch((err) => {
			 // Handle the case where there is an error connecting to the Python container
			errorResponse(
				res,
				500,
				`searcherror 3: couldnt connect to python container, is it running?. ${err.toString()}`
			);
		});
}
