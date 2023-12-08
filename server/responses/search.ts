import { IncomingMessage as Request, ServerResponse as Response } from 'http';
import { determineMimeType, getPostData, TimeoutWrapper } from '../serverHelpers';
import { errorResponse } from '../responseHandlers';
import { llamaUrl } from '../../app';

type queryRequest = {
    query: string,
}

type llamaResponse = {
    "choices": [
        choices
    ],
    "created": number,
    "id": string,
    "model": string,
    "object": string,
    "usage": any,
}

type choices = {
    "finish_reason": string,
    "index": number,
    "logprobs": string | null | any
    "text": string
}


export function Llama_Analyze(req: Request, res: Response) {
    // Step 1: Extract data from the request body
    getPostData(req)
        .then (async(data) => {
            console.log("Data: " + JSON.stringify(data));

            // Step 2: Format the data as per the Llama API request structure
            const formattedData = data as queryRequest;
            const request = {
                "system_message": "",
                "user_message": `The sentence is "${formattedData.query}". List the subject, object and predicate in the sentence.\
                Do not provide any other information and do not respond with anything else other\
                than the list. Do not provide an answer to any questions that the sentence prompts, just make the list in this format:\
                subject: thesubject \n object: theobject \n predicate: thepredicate. if any of them don't exist in the query do like this: predicate: null`,


                "max_tokens": 100
            }
            // Step 3: Make a request to the Llama API to generate a response
                const options : object = {
                    url: llamaUrl,
                    headers: {"access-authorization": "7b15182275a73ddbc9da3e58c5ecd22baa2bad1f", "Content-Type": "application/json"},
                    body: JSON.stringify(request),
                    timeout: 720000 
                }

                const llamaResponse = await TimeoutWrapper(options);
                console.log("Llama response: " + JSON.stringify(llamaResponse));
                const sentence =llamaResponse.choices[0].text
            
                    // Step 4: Extract and process the response from Llama
                    
                    // Step 5: Use regular expressions to extract subject, object, and predicate
                    const subjectRegex = /Subject:\s*(.*)($|\n|\()/;
                    const objectRegex = /Object:\s*(.*)($|\n|\()/;
                    const predicateRegex = /Predicate:\s*(.*)($|\n|\()/;


                    const subjectMatches = sentence.match(subjectRegex)
                    const subjectWord = subjectMatches != null && subjectMatches.length > 0 && subjectMatches[1] !== "null" ? subjectMatches[1] : null;

                    const objectMatches = sentence.match(objectRegex);
                    const objectWord = objectMatches != null && objectMatches.length > 0 && objectMatches[1] !== "null" ? objectMatches[1]: null;

                    const predicateMatches = sentence.match(predicateRegex)
                    const predicateWord = predicateMatches != null && predicateMatches.length > 0 && predicateMatches[1] !== "null" ? predicateMatches[1] : null;
                    
                    // Step 6: Log the extracted information for debugging purposes
                    console.log("text" + sentence);
                    console.log("Subject: " + subjectWord);
                    console.log("Object: " + objectWord);
                    console.log("Predicate: " + predicateWord);
                    if(subjectWord==null && objectWord==null && predicateWord==null){
                        console.log("Llama returned full NULL");
                    }
                    return fetch_TripleFromGraph(subjectWord, objectWord, predicateWord);
                })             
                //.catch((err) => {
                //    errorResponse(res, 500, "Could not contact Llama");
                //})
        }
                
        

// Sends a post request to the knowledgegraph and receives nodes. as the knowledgegraph is incomplete at this moment, we cant get pdf URL keys
export async function fetch_TripleFromGraph(subject: string | null, object: string | null, predicate: string | null) {
    const subParam = subject != null ? "&s=" + subject : "";
    const objParam = object != null ? "&o=" + object : "";
    const predParam = predicate != null ? "&p=" + predicate : "";
    const graphURL = `http://knox-proxy01.srv.aau.dk/knox-api/triples?g=http://knox_database${subParam}${objParam}${predParam}`
    
    console.log("\nlets fetch the triple from knowledge graph: ");
    console.log("url: "+graphURL);
       const response = await fetch(graphURL, {
            method: "GET",
            headers: { "access-authorization": "7b15182275a73ddbc9da3e58c5ecd22baa2bad1f", "Content-Type": "application/json",  },
        });

        const output_response = (await response.json()) as tripleResponse;
        console.log("the response is: " + JSON.stringify(output_response));
        
        const nodeArray:string[]  = [];
        output_response.triples.forEach(element => {
            console.log("this is an element value: " + element.s.Value.split('/').pop());
            console.log("this is an element value: " + element.o.Value.split('/').pop());
            console.log("this is an element value: " + element.p.Value.split('/').pop());
            nodeArray.push(element.s.Value.split('/').pop() as string);
            nodeArray.push(element.o.Value.split('/').pop() as string);
            nodeArray.push(element.p.Value.split('/').pop() as string);
        });
        
        console.log("\nthis is the node array: " + nodeArray);
        


        // future works: extract the URL of pdf from the response. at the time of writing, there is no URL key
        // return callRankingscript(nodeArray);
       
}

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