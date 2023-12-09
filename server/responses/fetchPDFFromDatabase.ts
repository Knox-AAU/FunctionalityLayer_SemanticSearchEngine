import { determineMimeType, getPostData } from '../serverHelpers';
import { errorResponse } from '../responseHandlers';
import { IncomingMessage as Request, ServerResponse as Response } from 'http';

export async function FetchPdfArray(url: string, nodeArray: string[], res: any): Promise<void> {
    try {
        const response = await fetch(url + 'query', {
            method: 'POST',
            body: JSON.stringify(nodeArray),
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Response OK');
            console.log('Data: ', JSON.stringify(nodeArray));

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.write(JSON.stringify(data));
            res.end('\n');
        } else {
            console.log('Err');
            errorResponse(res, response.status, `searcherror 2: Llama API returned an error status (${response.status}).`);
        }
    } catch (err) {
        console.error('Error during fetch:', err.toString());
        errorResponse(res, 500, `searcherror 3: Failed to fetch data from Llama API. ${err.toString()}`);
    }
}