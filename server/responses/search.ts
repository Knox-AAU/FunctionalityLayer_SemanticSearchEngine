import { IncomingMessage as Request, ServerResponse as Response } from 'http';
import { determineMimeType, getPostData } from '../serverHelpers';
import { errorResponse } from '../responseHandlers';
import { llamaUrl } from '../../app';

type queryRequest = {
    query: string,
}

const targetContainerHostname = 'ranking'; //  container name

export const url = `http://${targetContainerHostname}:6969/`; //  portNumber and path 

export function search(req: Request, res: Response) {
    getPostData(req)
        .then((data) => {
            const formattedData = data as queryRequest;
            /*const request = {
                "system_message": "Hello There",
                "user_message": `The sentence is "${formattedData.query}". List the subject, object and predicate in the sentence.\
                Do it as a bulletpoint list. Do not provide any other information and do not respond with anything else other\
                than the list. Do not provide an answer to any questions that the sentence prompts, just make the list`,
                "max_tokens": 100
            }
            fetch(llamaUrl, {
                method: "POST",
                headers: { "access-authorization": "7b15182275a73ddbc9da3e58c5ecd22baa2bad1f" },
                body: JSON.stringify(request),
            })
                .then((response) => response.json())
                .then((data) => {
                    console.log(data);
                })*/
            fetch(url + "query", {
                method: "POST",
                body: JSON.stringify(data)
            })
                .then(async (response) => {
                    if (response.ok) {
                        console.log("Response OK")
                        response.json()
                            .then((data) => {
                                console.log("Data")
                                console.log(JSON.stringify(data))
                                res.statusCode = 200;
                                res.setHeader('Content-Type', determineMimeType(".json"));
                                res.write(JSON.stringify(data));
                                res.end("\n");
                            })
                            .catch((err) => {
                                errorResponse(res, 500, `searcherror 1: Failed to parse response data. ${err.toString()}`);
                            });
                    } else {
                        console.log("Err");
                        errorResponse(res, response.status, `searcherror 2: Llama API returned an error status (${response.status}).`);
                    }
                })
                .catch((err) => {
                    errorResponse(res, 500, `searcherror 3: Failed to fetch data from Llama API. ${err.toString()}`);
                });
        })
        .catch((err) => {
            errorResponse(res, 503, `searcherror 4: Could not extract data from the request body. ${err.toString()}`);
        });
}