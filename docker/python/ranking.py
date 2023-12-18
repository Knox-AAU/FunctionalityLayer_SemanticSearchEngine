from bm25f_and_bert import BM25F_and_BERT   
from bm25f import BM25F
import psycopg2
import logging
import time
import shared_utils

class Ranking:
    def __init__(self):
        # Set the model readiness flag to True
        shared_utils.is_model_ready = True

        # Define field weights for BM25F
        self.field_weights = {"title": 0.5, "body": 0.5}
        
        # Set the number of fields in shared_utils for reference
        shared_utils.nr_of_fields = len(self.field_weights)
        
        # Establish a connection to the PostgreSQL database
        shared_utils.logger.info("Postgres: Connecting...")
        retries = 0
        max_retries = 10
        while retries < max_retries:
            try:
                conn = psycopg2.connect(
                    dbname="semanticDB",
                    user="defaultuser",
                    password="1234",
                    host="postgres",  #database host
                    port="5432"         # default PostgreSQL port
                )
                break  # Connection successful, exit loop
            except psycopg2.OperationalError:
                shared_utils.logger.info("Postgres: not ready, retrying in 5 seconds...")
                retries += 1
                time.sleep(5)
        
        # Fetch data from the PostgreSQL pdfTable
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM pdfTable")
        rows = cursor.fetchall()
        shared_utils.logger.info("Postgres: Connection established")
        cursor.close()
        conn.close()

        # Initialize document array with PDF information
        self.docArray = []  
        shared_utils.logger.info("Documents: Starting...")
        for row in rows:
            with open(row[3], 'r') as file:
                self.docArray.append({
                    "title": row[0].lower(),
                    "body": file.read().lower(),
                    "originalTitle": row[0],
                    "url": row[1],
                    "pdfPath": row[2],
                    "author": row[4],
                    "timeStamp": row[5]
                })
        
        shared_utils.logger.info("Documents: Amount of Documents: " + str(len(self.docArray)))

        # Split documents into BM25F-compatible format
        shared_utils.logger.info("Documents: Splitting... ")
        self.split_documents = []
        #for doc in self.docArray:
        #    self.split_documents.append(BM25F.bm25f_document_split(doc))
        shared_utils.logger.info("Documents: Splitting done ")

        # Process documents with BM25F and BERT
        shared_utils.logger.info("Documents: Processing.... This will take a while ")
        if len(self.docArray) > 0:
            self.bm25f_bert_instance = BM25F_and_BERT(self.docArray, self.field_weights)
            self.bm25f_bert_instance.calculate_bert_embedding(self.docArray)
            shared_utils.is_model_ready = True
        else:
            shared_utils.is_model_ready = False
        shared_utils.logger.info("Documents: Done Processing and ready for requests")

    # Static method to trim unnecessary information from the result
    @staticmethod
    def Trim(item):
        doc, score = item
        return {
            "URL": doc.get("url"),
            "pdfPath": doc.get("pdfPath"),
            "Title": doc.get("originalTitle"),
            "Score": score,
            "TimeStamp": doc.get("timeStamp"),
            "Author": doc.get("author")
        }

    def handle_request(self, query):
        # Method to handle incoming requests and return ranked results
        #shared_utils.logger.info("Response")  
        result = self.bm25f_bert_instance.rank_documents_BM25AndBert(query, self.docArray)
        #shared_utils.logger.info("Response")  
        #shared_utils.logger.info(result)
        
        # Trim results and return as a list of dictionaries
        combined_json_top_10_results = map(self.Trim, result)
        return list(combined_json_top_10_results)
