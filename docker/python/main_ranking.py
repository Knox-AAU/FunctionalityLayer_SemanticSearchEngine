import math 
from collections import Counter
from transformers import BertModel, BertTokenizer
import torch
import numpy as np
import sys
import http.server
import socketserver
import json
from urllib.parse import parse_qs
import requests
import psycopg2
import time
import logging
from ranking import Ranking
from requesthandler import RequestHandler
import shared_utils


# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)

# bert_field_weight = True
# shared_utils.nr_of_fields = 2
# handler = None
# shared_utils.is_model_ready = False
#File contains both the class BM25F and BM25FBERT. BM25FBERT is a subclass of BM25F, but it is possible to rewrite the class to not inherit from BM25F. However, BM25F is kept as a complete class incase future work needs it. Same goes for function to score docArray.



        
if __name__ == "__main__":
    # Debugging print statements
    print("Creating HTTP server", file=sys.stdout)
    port = 6969
    directory = '.'
    httpd = socketserver.TCPServer(("0.0.0.0", port), RequestHandler)
    shared_utils.handler = Ranking()
    print(f"Serving on port {port}", file=sys.stdout)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer terminated by user.", file=sys.stdout)
