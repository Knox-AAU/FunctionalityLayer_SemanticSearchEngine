import json
import http.server
import sys

from ranking import Ranking


class RequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        from main_ranking import handler
        print("Initializing RequestHandler", file=sys.stdout)
        # Call the __init__ method of the base class
        super().__init__(*args, **kwargs)
        # Create an instance of Ranking when the server starts

    def query(self, json_data):
        from main_ranking import is_model_ready
        from main_ranking import handler
        from main_ranking import logger

        query = json_data["query"]
        if is_model_ready: 
            result = handler.handle_request(query)
            # Send the response
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()

            # Convert the result to JSON and send it
            response = json.dumps(result).encode('utf-8')
            logger.info(response)
            self.wfile.write(response)
        else:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            response = json.dumps({"Err": "Processing docArray, please wait"}).encode('utf-8')
            self.wfile.write(response)
            self.end_headers()
    
    def reset(self, json_data):
        from main_ranking import handler
        self.send_response(200)
        self.end_headers()
        handler = Ranking()
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
