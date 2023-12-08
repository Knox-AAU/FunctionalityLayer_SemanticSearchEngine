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
import unittest
import requests

#File contains both the class BM25F and BM25FBERT. BM25FBERT is a subclass of BM25F, but it is possible to rewrite the class to not inherit from BM25F. However, BM25F is kept as a complete class incase future work needs it. Same goes for function to score documents.
class BM25F:
    #Initialize BM25F to be used for function calculate_bm25f_score in the class. Tweak k1 and b for better performing BM25F.
    def __init__(self, documents, field_weights):
        self.documents = documents
        self.documents_count = len(documents)
        self.avg_field_lengths = self.calculate_avg_field_lengths()
        self.term_counts = self.calculate_term_counts()
        self.k1 = 2
        self.b = 1
        self.field_weights = field_weights

    #Calculates avgerage field lengths, which is needed to calculate denominator used for score calculation
    def calculate_avg_field_lengths(self):
        avg_field_lengths = {}
        for field in self.documents[0].keys():
            total_length = sum(len(doc[field]) for doc in self.documents)
            avg_field_lengths[field] = total_length / self.documents_count
        return avg_field_lengths

    #Calculates how many times the term appears in the document. Term count is needed to calculate inverted document frequency
    def calculate_term_counts(self):
        term_counts = Counter()
        for document in self.documents:
            for field in document:
                term_counts.update(document[field])
        return term_counts

    #Simple function that returns inverted document frequency
    def calculate_idf(self, term):
        document_with_term_count = self.term_counts[term]
        return math.log((self.documents_count - document_with_term_count + 0.5) / (document_with_term_count + 0.5) + 1.0)

    #Function which splits a string so that BM25F can search the document for each keyword in query
    def bm25f_query_split(self, query):
        query_string = query[0]
        query_words = query_string.split()
        return query_words
    
    #Function which splits the document so that BM25F can properly search the document for each keyword
    def bm25f_document_split(self, document):
        split_title = document["title"][0].split()
        split_body = document["body"][0].split()
        title_with_commas = ", ".join(split_title)
        body_with_commas = ", ".join(split_body)
        split_document = {
        "title": title_with_commas,
        "body": body_with_commas
        }
        return split_document
    
    #Function which calculates and returns BM25F score. 
    def calculate_bm25f_score(self, query, document):
        document = self.bm25f_document_split(document)
        query = self.bm25f_query_split(query)
        score = 0.0
        document_lengths = {field: len(document[field]) for field in document}
        query_terms = Counter(query)
        for term in query_terms:
            idf = self.calculate_idf(term)
            for field in document:
                if term not in document[field]:
                    continue
                term_frequency = document[field].count(term)
                numerator = term_frequency * (self.k1 + 1)
                denominator = term_frequency + self.k1 * (1 - self.b + self.b * (document_lengths[field] / self.avg_field_lengths[field]))
                score += self.field_weights[field] * idf * (numerator / denominator)
        return score

    #Function which appends each document with BM25F score.
    def rank_documents(self, query):
        document_scores = []
        for document in self.documents:
            score = self.calculate_bm25f_score(query, document)
            document_scores.append((document, score))
        ranked_documents = sorted(document_scores, key=lambda x: x[1], reverse=True)
        return ranked_documents


class BM25F_and_BERT(BM25F):
    #Function which initializes BERT using bert-base-uncased as the BERT model.
    def __init__(self, documents, field_weights, bert_model_name="bert-large-uncased"):
        super().__init__(documents, field_weights)
        self.bert_model = BertModel.from_pretrained(bert_model_name)
        self.tokenizer = BertTokenizer.from_pretrained(bert_model_name)

    #Function which generate BERT embedding of a text. Used to generate BERT embedding of query and document.
    def calculate_bert_embedding(self, documents):
        # Combine title and body into a single string for each document
        document_texts = [" ".join(doc["title"] + doc["body"]) for doc in documents]
        # Tokenize and calculate BERT embedding for each document
        embeddings = []
        for text in document_texts:
            # Split text into chunks of max_seq_length tokens
            max_seq_length = self.tokenizer.model_max_length
            chunks = [text[i:i+max_seq_length] for i in range(0, len(text), max_seq_length)]
            # Calculate BERT embedding for each chunk
            chunk_embeddings = []
            for chunk in chunks:
                tokens = self.tokenizer.tokenize(self.tokenizer.decode(self.tokenizer.encode(chunk)))
                indexed_tokens = self.tokenizer.convert_tokens_to_ids(tokens)
                segments_ids = [1] * len(tokens)
                tokens_tensor = torch.tensor([indexed_tokens])
                segments_tensors = torch.tensor([segments_ids])
                with torch.no_grad():
                    outputs = self.bert_model(tokens_tensor, segments_tensors)
                chunk_embeddings.append(outputs[0][0][0].numpy())
        # Aggregate embeddings for the entire document
        embeddings.append(np.mean(chunk_embeddings, axis=0))
        return embeddings
    

    #Function to calculate and return BERT score. 
    def calculate_bert_score(self, query, document):
        query_embedding = self.calculate_bert_embedding([{"title": query, "body": []}])[0]
        document_embedding = self.calculate_bert_embedding([document])[0]
        score = 0.0
        # Calculate cosine similarity between query and document embeddings
        similarity = self.calculate_cosine_similarity(query_embedding, document_embedding)
        # Normalize BERT score based on the length of the document
        document_length = sum(len(document[field]) for field in document)
        normalized_bert_score = similarity / document_length
        for field in document:
            field_weight = self.field_weights.get(field, 1.0)
            score += field_weight * normalized_bert_score
        return score


    #Function to calculate similairty between two non-empty vectors, which are the BERT embeddings of a query and document.
    def calculate_cosine_similarity(self, vector1, vector2):
        dot_product = sum(a * b for a, b in zip(vector1, vector2))
        magnitude1 = math.sqrt(sum(a**2 for a in vector1))
        magnitude2 = math.sqrt(sum(b**2 for b in vector2))
        if magnitude1 == 0 or magnitude2 == 0:
            return 0.0
        return dot_product / (magnitude1 * magnitude2)

    #Function which ranks documents using both BM25F and BERT in a combined score, and appends it to each document.
    def rank_documents_bert(self, query, documents=None):
        if documents is None:
            documents = self.documents
        document_scores = []
        for document in documents:
            total_score_bm25f = 0.0
            # Calculate BM25F score for each word in the query
            for word in query:
                score_bm25f = self.calculate_bm25f_score([word], document)
                total_score_bm25f += score_bm25f
            # Calculate BERT score for the entire query
            score_bert = self.calculate_bert_score(query, document)
            # Combine BM25F and BERT scores
            combined_score = total_score_bm25f + score_bert
            document_scores.append((document, combined_score))
        # Sort documents based on the combined score in descending order
        ranked_documents = sorted(document_scores, key=lambda x: x[1], reverse=True)
        return ranked_documents
    
class TestBM25F(unittest.TestCase):
    def test_rank_documents_with_bm25f(self, result):
        for item in result:
            self.assertIsInstance(result, list, "Result is not a list")
            # Ensure each tuple has two elements: a document and a score
            self.assertEqual(len(item), 2)
            doc, score = item
            # Ensure the document is a dictionary
            self.assertIsInstance(doc, dict)
            # Ensure the score is a float
            self.assertIsInstance(score, float)

class TestBM25FBERT(unittest.TestCase):
    def test_rank_documents_with_bert(self, result):
        for item in result:
            self.assertIsInstance(result, list, "Result is not a list")
            # Ensure each tuple has two elements: a document and a score
            self.assertEqual(len(item), 2)
            doc, score = item
            # Ensure the document is a dictionary
            self.assertIsInstance(doc, dict)
            # Ensure the score is a float
            self.assertIsInstance(score, float)
            # Ensure the document has the expected fields
            self.assertIn("title", doc)
            self.assertIn("body", doc)
class Ranking:
    def __init__(self):
        self.field_weights = {"title": 0.05, "body": 0.95}
        #Load search query from SPOIdentifier.py and splits into individual words
        #self.query = ["Who served as first lady of the United States in 2021?"]
        
        self.documents = [{"title": ["Skrr skbidi"], "body": ["Barack Osams"]}, {"title": ["skrr skbidi"], "body": ["Barack Osams and the Queen"]}]

        self.bm25f_bert_instance = BM25F_and_BERT(self.documents, self.field_weights)

    @staticmethod
    def Trim(item):
        doc, score = item
        return {"URL": doc.get("URL"), "Title": doc.get("title"), "Score": score}

    def handle_request(self, query):
        result = self.bm25f_bert_instance.rank_documents_bert(query, self.documents)
        test_instance = TestBM25FBERT()

        test_instance.test_rank_documents_with_bert(result)   
        combined_json_top_10_results = map(self.Trim, result[0:10])
        return list(combined_json_top_10_results)

class RequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        print("Initializing RequestHandler")
        # Call the __init__ method of the base class
        super().__init__(*args, **kwargs)
        # Create an instance of Ranking when the server starts
        self.ranking_handler = Ranking()

    def do_GET(self):
        # Hardcoded query for testing; you can extract it from the request if needed
        query = ["Who served as first lady of the United States in 2021?"]
        # Handle the ranking request
        result = ranking_handler.handle_request(query)

        # Send the response
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()

        # Convert the result to JSON and send it
        response = json.dumps(result).encode('utf-8')
        self.wfile.write(response)

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        query = json.loads(post_data.decode('utf-8')).get('query', '')

        # Handle the query using the instance of Ranking
        result = ranking_handler.handle_request(query)

        # Send the response
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()

        # Convert the result to JSON and send it
        response = json.dumps(result).encode('utf-8')
        self.wfile.write(response)

if __name__ == "__main__":
    # Debugging print statements
    print("Creating HTTP server")
    port = 6969
    directory = '.'
    httpd = socketserver.TCPServer(("", port), RequestHandler)
    print(f"Serving on port {port}")
    ranking_handler = Ranking()
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer terminated by user.")
