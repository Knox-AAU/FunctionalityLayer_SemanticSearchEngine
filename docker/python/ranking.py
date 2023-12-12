from bm25f_and_bert import BM25F_and_BERT   
from bm25f import BM25F
import psycopg2
import logging
import time
import shared_utils

class Ranking:
    def __init__(self):
        shared_utils.is_model_ready = True

        self.field_weights = {"title": 0.5, "body": 0.5}
        shared_utils.nr_of_fields = len(self.field_weights)
        #Load search query from SPOIdentifier.py and splits into individual words
        #self.query = ["Who served as first lady of the United States in 2021?"]
        shared_utils.logger.info("Postgres: Connecting...")
        retries = 0
        max_retries = 10
        while retries < max_retries:
            try:
                conn = psycopg2.connect(
                    dbname="semanticDB",
                    user="defaultuser",
                    password="1234",
                    host="postgres",  # or your database host
                    port="5432"         # default PostgreSQL port
                )
                break  # Connection successful, exit loop
            except psycopg2.OperationalError:
                shared_utils.logger.info("Postgres: not ready, retrying in 5 seconds...")
                retries += 1
                time.sleep(5)
        
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM pdfTable")
        rows = cursor.fetchall()
        shared_utils.logger.info("Postgres: Connection established")

        cursor.close()
        conn.close()
        self.docArray = [] #should rename to pdfobjectarray
        shared_utils.logger.info("Documents: Starting...")
        for row in rows:
            with open(row[3], 'r') as file:
                self.docArray.append({"title" : [row[0]], "body": [file.read()], "url": row[1], "pdfPath": row[2], "timeStamp": row[5]})
                
        shared_utils.logger.info("Documents: Amount of Documents: " + str(len(self.docArray)))

        shared_utils.logger.info("Documents: Splitting... ")
        self.split_documents = []
        for doc in self.docArray:
            self.split_documents.append(BM25F.bm25f_document_split(doc))
        shared_utils.logger.info("Documents: Splitting done ")

        shared_utils.logger.info("Documents: Processing.... This will take a while ")
        if len(self.docArray) > 0:
            self.bm25f_bert_instance = BM25F_and_BERT(self.docArray, self.field_weights)
            #self.bert_documents_embeddings =
            self.bm25f_bert_instance.calculate_bert_embedding(self.docArray)
            shared_utils.is_model_ready = True
        else:
            shared_utils.is_model_ready = False
        shared_utils.logger.info("Documents: Done Processing and ready for requests")

    @staticmethod
    def Trim(item):
        doc, score = item
        return {"URL": doc.get("url"), "pdfPath": doc.get("pdfPath"), "Title": doc.get("title"), "Score": score, "TimeStamp": doc.get("timeStamp")}

    def handle_request(self, query):
        shared_utils.logger.info("Response")  
        result = self.bm25f_bert_instance.rank_documents_BM25AndBert(query, self.docArray, self.split_documents)
        shared_utils.logger.info("Response")  
        shared_utils.logger.info(result)
        combined_json_top_10_results = map(self.Trim, result)
        return list(combined_json_top_10_results)
