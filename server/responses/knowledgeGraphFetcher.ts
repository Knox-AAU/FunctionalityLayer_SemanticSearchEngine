import { errorResponse } from "../responseHandlers";
import { IncomingMessage as Request, ServerResponse as Response } from 'http';

type tripleResponse =
    {
        triples: [
            {
                s: {
                    Type: string,
                    Value: string
                },
                p: {
                    Type: string,
                    Value: string
                },
                o: {
                    Type: string,
                    Value: string
                },
            }
        ],
        query: string,
    }

// Sends a post request to the knowledgegraph and receives nodes. as the knowledgegraph is incomplete at this moment, we cant get pdf URL keys
/**
 * Fetches triples from a knowledge graph based on specified parameters.
 * @param res - Express Response object for handling errors
 * @param subject - Optional parameter for filtering by subject
 * @param object - Optional parameter for filtering by object
 * @param predicate - Optional parameter for filtering by predicate
 * @returns An array of node values extracted from the knowledge graph triples
 */ 
// res: response handles errors
export async function fetch_TripleFromGraph(res: Response, subject: string | null, object: string | null, predicate: string | null) {
    // Constructing parameters for the knowledge graph API based on the optional filters
    const subParam = subject != null ? "&s=" + subject : "";
    const objParam = object != null ? "&o=" + object : "";
    const predParam = predicate != null ? "&p=" + predicate : "";
    const graphURL = `http://knox-proxy01.srv.aau.dk/knox-api/triples?g=http://knox_database${subParam}${objParam}${predParam}`;

    console.log("\nfetching the triple from the knowledge graph: ");
    console.log("url: " + graphURL);

    // Making a GET request to the knowledge graph API
    const response = await fetch(graphURL, {
        method: "GET",
        headers: {
            "access-authorization": "7b15182275a73ddbc9da3e58c5ecd22baa2bad1f",
            "Content-Type": "application/json",
        },
    }).catch((err) => {
        // Handle errors in case the fetch operation fails
        errorResponse(res, 500, "Knowledge Graph: " + err.toString());
        return null;
    });

    // If there was an error during the fetch, return null
    if (!response) return null;

    // Parse the JSON response from the knowledge graph API
    const output_response = (await response.json()) as tripleResponse;
    console.log("the response is: " + JSON.stringify(output_response));

    // Extract node values from the triples and store them in an array
    const nodeArray: string[] = [];
    output_response.triples.forEach(element => {
        nodeArray.push(element.s.Value.split('/').pop() as string);
        nodeArray.push(element.o.Value.split('/').pop() as string);
        nodeArray.push(element.p.Value.split('/').pop() as string);
    });

    console.log("\nthis is the node array: " + nodeArray);

    // Return the array of node values
    return nodeArray;

    // future works: extract the URL of pdf from the response. at the time of writing, there is no URL key
 }
