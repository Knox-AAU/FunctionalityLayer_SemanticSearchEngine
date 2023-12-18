import json
import http.server
import sys

from ranking import Ranking
import shared_utils


class RequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        print("Initializing RequestHandler", file=sys.stdout)
        # Call the __init__ method of the base class
        super().__init__(*args, **kwargs)
        # Create an instance of Ranking when the server starts

    def query(self, json_data):

        query = json_data["query"]
        shared_utils.bmBertOrBoth = json_data["bmBertOrBoth"]
        if shared_utils.is_model_ready: 
            result = shared_utils.handler.handle_request(query)
            # Send the response
            shared_utils.logger.info("Result" + str(result))
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            # Convert the result to JSON and send it
            response = json.dumps(result).encode('utf-8')
            #shared_utils.logger.info("Response")
            #shared_utils.logger.info(response)
            self.wfile.write(response)
        else:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            response = json.dumps({"Err": "Processing docArray, please wait"}).encode('utf-8')
            self.wfile.write(response)
    
    def reset(self, json_data):
        self.send_response(200)
        self.end_headers()
        shared_utils.handler = Ranking()
        #self.send_header('Content-type', 'application/text')
        print("reset", file=sys.stdout)
    
    url_handlers = {
        "/": query,
        "/query": query,
        "/reset": reset,
    }

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        json_data = None
        try:
            json_data = json.loads(post_data)
        except ValueError as e:
            error_response = {
                "error": "Failed to parse JSON data",
                "details": str(e)
            }
            self._send_response(400, error_response)

        url = self.path
        if url in RequestHandler.url_handlers:
            # Call the appropriate function based on the URL
            response = RequestHandler.url_handlers[url](self, json_data)
            return response
