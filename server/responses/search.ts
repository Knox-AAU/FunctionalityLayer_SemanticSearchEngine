import { IncomingMessage as Request, ServerResponse as Response } from 'http';
import { Llama_Analyze } from './LlamaAnalyzer';


export function KNOXSearch(req: Request, res: Response){
    
    getPostData(req)
    .then (async(data) => {
        console.log("Data: " + JSON.stringify(data));
        const formattedData = data as queryRequest;
    Llama_Analyze(req: Request, res: Response)
    
    fetch_TripleFromGraph(subjectWord, objectWord, predicateWord);


}