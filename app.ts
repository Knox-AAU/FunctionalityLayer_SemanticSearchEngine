const online = false;

import * as http from 'http';
import { IncomingMessage as Request, ServerResponse as Response } from 'http';

import * as fs from 'fs';

const hostname = online ? '192.168.0.142' : 'localhost';
<<<<<<< HEAD
const port = +(process.env.PORT || 3000);
=======
const port = 3000;
>>>>>>> 0ea5ad0edd12a0336b6d2af2011e1f0af26f06ef

import { postHandler, getHandler, fileResponse, errorResponse } from './server/responseHandlers';


//Create server object with the function requestHandler as input
const server = http.createServer(requestHandler);

//Tells server to listen on ip and port
server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
    fs.writeFileSync('message.txt', `Server running at http://${hostname}:${port}/`);
});

//Process a request, if it failes respond with error 500
function requestHandler(req: Request, res: Response) {
    try {
        processReq(req, res);
    } catch (err) {
        errorResponse(res, 500, "Internal Error" + err);
    }
}

//Function to process a request, can fail hence the function requestHandler
function processReq(req: Request, res: Response) {
    //Remove the first "/" as we do not use absolute paths
    req.url = req.url!.substring(1);
    //The webpages initial page is simply "/" which was just removed so it's
    //now "" but the actual page is "Pages/index.html", so we make a special case
    //for "/"
    req.url = req.url == "" ? "build/index.html" : "build/" + req.url;
    //Depending on http method used, different handlers handle the request. If an
    //unexpected method type appears we attempt to respond with a default file 
    //response
    console.log("Request: " + req.method + " " + req.url);
    switch (req.method) {
        case 'POST':
            return postHandler(req, res);
        case 'GET':
            return getHandler(req, res);
        default:
            return fileResponse(req.url, res);
    }
}