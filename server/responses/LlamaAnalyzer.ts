import { IncomingMessage as Request, ServerResponse as Response } from 'http';
import { determineMimeType, getPostData } from '../serverHelpers';
import { errorResponse } from '../responseHandlers';
import { llamaUrl } from '../../app';

type llamaResponse = {
	choices: [choices];
	created: number;
	id: string;
	model: string;
	object: string;
	usage: any;
};

type choices = {
	finish_reason: string;
	index: number;
	logprobs: string | null | any;
	text: string;
};

export function regexWordExtractor(sentence: string): string[] {
	const subjectRegex = /Subject:\s*(.*)($|\n|\()/;
	const objectRegex = /Object:\s*(.*)($|\n|\()/;
	const predicateRegex = /Predicate:\s*(.*)($|\n|\()/;

	const subjectMatches = sentence.match(subjectRegex);
	const subjectWord =
		subjectMatches != null &&
			subjectMatches.length > 0 &&
			subjectMatches[1] !== 'null'
			? subjectMatches[1]
			: '';

	const objectMatches = sentence.match(objectRegex);
	const objectWord =
		objectMatches != null &&
			objectMatches.length > 0 &&
			objectMatches[1] !== 'null'
			? objectMatches[1]
			: '';

	const predicateMatches = sentence.match(predicateRegex);
	const predicateWord =
		predicateMatches != null &&
			predicateMatches.length > 0 &&
			predicateMatches[1] !== 'null'
			? predicateMatches[1]
			: '';
	if (subjectWord === '' && objectWord === '' && predicateWord === '') {
		console.log(
			'Llama returned full NULL, partial triple set to 3 empty strings'
		);
	}
	// Return the results as an array of strings
	return [subjectWord, objectWord, predicateWord];
}

// returns an array: [subject, object, predicate]
export async function Llama_Analyze(
	res: Response, // res: response handles errors
	userQuery: string
): Promise<string[] | null> {
	const LlamaCommand = {
		system_message: '',
		user_message: `The sentence is "${userQuery}". List the subject, object and predicate in the sentence.\
        Do not provide any other information and do not respond with anything else other\
        than the list. Do not provide an answer to any questions that the sentence prompts, just make the list in this format:\
        subject: thesubject \n object: theobject \n predicate: thepredicate. if any of them don't exist in the query do like this: predicate: null`,
		max_tokens: 100,
	};
	JSON.stringify(LlamaCommand);
	// Step 3: Make a request to the Llama API to generate a response
	return fetch(llamaUrl, {
		method: 'POST',
		headers: {
			'access-authorization': '7b15182275a73ddbc9da3e58c5ecd22baa2bad1f',
			'Content-Type': 'application/json',
			//'Keep-Alive': 'timeout=720, max=1',
		},
		body: JSON.stringify(LlamaCommand),
	})
		.then((response) => {
			return response.json();
		})
		.then((data) => {
			if (!data || data.choices || data.choices[0] || data.choices[0].text) {
				errorResponse(res, 500, "Invalid response from Llama");
				return null;
			}
			const extractedInfo = regexWordExtractor(data.choices[0].text);
			return extractedInfo;
		})
		.catch((err) => {
			console.log(err);
			errorResponse(res, 500, err.toString());
			return null;
		});
}
