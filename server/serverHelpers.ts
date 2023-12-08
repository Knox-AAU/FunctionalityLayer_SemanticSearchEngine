import { errorResponse } from "./responseHandlers";
import * as fs from 'fs';
import { IncomingMessage as Request, ServerResponse as Response } from 'http';

//MIME type is an identifyer to help the browser understand what to do with
//a given file
export function determineMimeType(fileName: String) {
    //Get the filetype fx "mp4" in "funny.mp4" we make the temp object to
    //avoid splitting twice as this can be an expensive operation
    let temp = fileName.split('.');
    let fileType = temp[temp.length - 1];
    const typeTable: { [key: string]: string } = {
        "js": "text/javascript",
        "mjs": "text/javascript",
        "html": "text/html",
        "css": "text/css",
        "ico": "image/vnd.microsoft.icon",
        "json": "application/json",
        "png": "image/png",
        "svg": "image/svg+xml"
    }
    //returns the mimetype if it could be found in the typeTable
    //otherwise assume the type to be "text/plain"
    return (typeTable[fileType] || "text/plain");
}

//Gets arguments from a request of method GET and puts them in a neat
//object
export function getArgs(argsRaw: String) {
    let args: { [key: string]: string } = {};
    //if there are no arguments return an empty object
    if (argsRaw == undefined) return args;
    //Each argument in a url with method type GET is separated with a
    //"&" so we add all the arguments according to that
    argsRaw.split('&').forEach(element => {
        //All arguments looks like "uname=hello" so we set the key to
        //the part before "=" and the value to the part after
        args[element.split('=')[0]] = element.split('=')[1];
    });
    return args;
}

//Merges an object of timportObjectype JSON with a object on the disk of type JSON
//Think of it like the Array.push() function but for objects on the
//disk
export function exportObjectPush(path: String, object: Object, res: Response) {
    let arr: Object[] = [];
    //We import the file first so we can add an object to it
    const temp = importObject(path, res);
    if (temp == 1) return 1;

    //Check to see if imported array is not empty
    if (temp != "" && temp != "[]") arr = temp;
    //Check to make sure imported data is of type: array
    if (!Array.isArray(arr)) return errorResponse(res, 500, "Internal Error: Imported object is not Array, Path to object: " + path);
    //add the object to the end/start of the array
    arr.push(object);

    //Write the object to the disk
    return exportObject(path, arr, res);
}

//Exports an object to disk
export function exportObject(path: String, object: Object, res: Response) {
    try {
        fs.writeFileSync(path as fs.PathOrFileDescriptor, JSON.stringify(object, null, 4), {
            encoding: "utf8",
            flag: "a+",
            mode: 0o666,
        });
        /*
        fs.writeFileSync(path as fs.PathOrFileDescriptor, JSON.stringify(object, {
            //Just metadata stuffs
            encoding: "utf8",
            flag: "a+",
            mode: 0o666,
        }, 4));
        */
        //The "4" adds lines in the file so the printed object is readable to humans
        return 0;
    } catch {
        return errorResponse(res, 500, "Internal Error: Could not write to disk, Path: " + path);
    }
}

//Reads an object from disk
export function importObject(path: String, res: Response) {
    //read a file synchronously, should probs be changed to read asynchronously
    //but deadlines
    let temp = "";
    try {
        temp = fs.readFileSync(path as fs.PathOrFileDescriptor, 'utf8');
        if (temp != "") {
            return JSON.parse(temp);
        }
        errorResponse(res, 500, "Internal Error: Data file not found: " + path);
        return 1;
    } catch (err) {
        errorResponse(res, 500, "Internal Error: Reading file failed " + path + "  :  Cought error: " + err);
        return 1;
    }
}

//Returns promise that retrieves post data in chunks
export function getPostData(req: Request) {
    return new Promise((resolve, reject) => {
        let body = ""
        req.on('data', chunk => {
            body += chunk.toString(); // convert Buffer to string
        });
        req.on('end', () => {
            if (body == "") reject("Empty post request");
            try {
                resolve(JSON.parse(body));
            } catch (err) {
                reject("Failed to parse JSON: " + err);
            }
        });
    });
}
/*
//Gets the last element in an array after splitting a string
export function getLastSplit(input: String, splitChar: String) {
    const temp = input.split(splitChar);
    return temp[temp.length - 1]
}
*/
export function validateUserExistence(res: Response, id: String) {
    res;
    let userPath = "server/data/logins.json"
    return new Promise((resolve, reject) => {
        fs.readFile(userPath, (err, fileData) => {
            if (err) {
                reject("Could not read Login file: " + err);
                //console.log("Could not read Login file: " + err);
                //errorResponse(res, 500, "Could not read Login file: " + err);
            } else {
                const fileDataO = JSON.parse(fileData.toString());
                for (let i = 0; i < fileDataO.users.length; i++) {
                    if (fileDataO.users[i].id == id) {
                        resolve(true);
                    }
                }
                return resolve(false);
            }
        })
    })

}
export async function TimeoutWrapper(options: any) {
    const timeoutDuration = options.timeout || 720000; // Default timeout to 10 seconds
    const timeoutId = setTimeout(() => {
      throw new Error('Request timed out');
    }, timeoutDuration);
  
    try {
      const response = await fetch(options.url, {
        method: 'POST',
        headers: options.headers,
        body: options.body,
      });
      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error && error.message === 'Request timed out') {
        console.error('Request to', options.url, 'timed out after', timeoutDuration, 'ms');
      } else {
        throw error;
      }
    } finally {
      clearTimeout(timeoutId);
    }
  };
/*
Array.prototype.contains = function (target) {
    for (let i = 0; i < this.length; i++) {
        if (this[i] == target) return true;
    }
    return false;
};

Array.prototype.containsAttribute = function (target, attribute) {
    for (let i = 0; i < this.length; i++) {
        if (this[i][attribute] == target) return true;
    }
    return false;
};
*/