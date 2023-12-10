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
export async function fetch_TripleFromGraph(res: Response, subject: string | null, object: string | null, predicate: string | null) {
    const subParam = subject != null ? "&s=" + subject : "";
    const objParam = object != null ? "&o=" + object : "";
    const predParam = predicate != null ? "&p=" + predicate : "";
    const graphURL = `http://knox-proxy01.srv.aau.dk/knox-api/triples?g=http://knox_database${subParam}${objParam}${predParam}`

    console.log("\nfetching the triple from knowledge graph: ");
    console.log("url: " + graphURL);
    const response = await fetch(graphURL, {
        method: "GET",
        headers: { "access-authorization": "7b15182275a73ddbc9da3e58c5ecd22baa2bad1f", "Content-Type": "application/json", },
    })
        .catch((err) => {
            errorResponse(res, 500, "Knowledge Graph: " + err.toString());
            return null;
        })
    if (!response) return null;
    const output_response = (await response.json()) as tripleResponse;
    console.log("the response is: " + JSON.stringify(output_response));

    const nodeArray: string[] = [];
    output_response.triples.forEach(element => {
        console.log("this is an element value: " + element.s.Value.split('/').pop());
        console.log("this is an element value: " + element.o.Value.split('/').pop());
        console.log("this is an element value: " + element.p.Value.split('/').pop());
        nodeArray.push(element.s.Value.split('/').pop() as string);
        nodeArray.push(element.o.Value.split('/').pop() as string);
        nodeArray.push(element.p.Value.split('/').pop() as string);
    });

    console.log("\nthis is the node array: " + nodeArray);

    return nodeArray;

    // future works: extract the URL of pdf from the response. at the time of writing, there is no URL key
    // return callRankingscript(nodeArray);

}
