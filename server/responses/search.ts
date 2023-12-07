import { IncomingMessage as Request, ServerResponse as Response } from 'http';
import { getPostData } from '../serverHelpers';
import { errorResponse } from '../responseHandlers';
import { llamaUrl } from '../../app';

type queryRequest = {
    query: string,
}

export function search(req, res) {
    getPostData(req)
        .then((data) => {
            const formattedData = data as queryRequest;
            const request = {
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
                })
        })
        .catch((err) => {
            errorResponse(res, 500, "Could not contact Llama");
        })
}