import { IncomingMessage as Request, ServerResponse as Response } from 'http';
import { url } from './search';

export function resetDB(req: Request, res: Response) {
    fetch(url + "reset", {
        method: "POST",
        body: JSON.stringify({})
    })
        .then((response) => {
            if (response.ok) {
                res.statusCode = 200;
                res.end("\n");
            }
        })
}