import { IncomingMessage as Request, ServerResponse as Response } from 'http';
import { determineMimeType, getPostData } from '../serverHelpers';
import { errorResponse } from '../responseHandlers';
import { llamaUrl } from '../../app';
import { TimeoutWrapper } from '../timeoutExtender';


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

export function regexWordExtractor(sentence: string): any[] {
    const subjectRegex = /Subject:\s*(.*)($|\n|\()/;
    const objectRegex = /Object:\s*(.*)($|\n|\()/;
    const predicateRegex = /Predicate:\s*(.*)($|\n|\()/;

    const subjectMatches = sentence.match(subjectRegex);
    const subjectWord = subjectMatches != null && subjectMatches.length > 0 && subjectMatches[1] !== "null" ? subjectMatches[1] : null;

    const objectMatches = sentence.match(objectRegex);
    const objectWord = objectMatches != null && objectMatches.length > 0 && objectMatches[1] !== "null" ? objectMatches[1] : null;

    const predicateMatches = sentence.match(predicateRegex);
    const predicateWord = predicateMatches != null && predicateMatches.length > 0 && predicateMatches[1] !== "null" ? predicateMatches[1] : null;

    return [subjectWord, objectWord, predicateWord];
}

// returns an array: [subject, object, predicate]
export async function Llama_Analyze(userQuery: string): Promise<any[]> {

    const LlamaCommand = {
        "system_message": "",
        "user_message": `The sentence is "${userQuery}". List the subject, object and predicate in the sentence.\
        Do not provide any other information and do not respond with anything else other\
        than the list. Do not provide an answer to any questions that the sentence prompts, just make the list in this format:\
        subject: thesubject \n object: theobject \n predicate: thepredicate. if any of them don't exist in the query do like this: predicate: null`,
        "max_tokens": 100
    }
    // Step 3: Make a request to the Llama API to generate a response
    const options : object = {
        url: llamaUrl,
        headers: {"access-authorization": "7b15182275a73ddbc9da3e58c5ecd22baa2bad1f", "Content-Type": "application/json"},
        body: JSON.stringify(LlamaCommand),
        timeout: 720000 
    }

    // Step 4: Extract and process the response from Llama
    const llamaResponse = await TimeoutWrapper(options);
    console.log("Llama response: " + JSON.stringify(llamaResponse));
    const sentence =llamaResponse.choices[0].text
        
    // Step 5: Use regular expressions to extract subject, object, and predicate
    const extractedInfo = regexWordExtractor(llamaResponse.choices[0].text);
    console.log("Extracted Information: ", extractedInfo);    
    return extractedInfo;
}          
   
        

