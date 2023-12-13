from bm25f import BM25F
from transformers import BertModel, BertTokenizer
import torch
import numpy as np
import math 
import logging
import shared_utils

class BM25F_and_BERT(BM25F):
    #Function which initializes BERT using bert-base-uncased as the BERT model.
    def __init__(self, docArray, field_weights, bert_model_name="bert-large-uncased"):
        super().__init__(docArray, field_weights)
        self.bert_model = BertModel.from_pretrained(bert_model_name)
        self.tokenizer = BertTokenizer.from_pretrained(bert_model_name)
    
    #Function which generate BERT embedding of a text. Used to generate BERT embedding of query and document.
    def calculate_bert_embedding(self, docArray, isQuery = False):
        # Combine title and body into a single string for each document        
        for input_doc in docArray:
            if shared_utils.bert_field_weight and not isQuery:
                input_doc["bodytext"] = input_doc["body"][0]
                input_doc["titletext"] = input_doc["title"][0]
            else:
                input_doc["text"] = "".join(input_doc["title"] + input_doc["body"])

        # Tokenize and calculate BERT embedding for each document
        for doc in docArray:
            # Split text into chunks of max_seq_length tokens
            max_seq_length = self.tokenizer.model_max_length
            if shared_utils.bert_field_weight and not isQuery:
                titleChunks = [doc["titletext"][i:i+max_seq_length] for i in range(0, len(doc["titletext"]), max_seq_length)]
                bodyChunks = [doc["bodytext"][i:i+max_seq_length] for i in range(0, len(doc["bodytext"]), max_seq_length)]
                chunk_embeddings = {}
                chunk_embeddings["title"] = self.chunkEmbedding(titleChunks)
                chunk_embeddings["body"] = self.chunkEmbedding(bodyChunks)

            else:
                chunks = [doc["text"][i:i+max_seq_length] for i in range(0, len(doc["text"]), max_seq_length)]
                chunk_embeddings = self.chunkEmbedding(chunks)
            
            # Aggregate embeddings for the entire document
            if isQuery:
                return np.mean(chunk_embeddings, axis=0)
            else:
                if shared_utils.bert_field_weight:
                    doc["embedding"] = {
                        "title": np.mean(chunk_embeddings["title"], axis=0),
                        "body": np.mean(chunk_embeddings["body"], axis=0)
                    }
                else:
                    doc["embedding"] = np.mean(chunk_embeddings, axis=0)
                doc["text"] = ""

    def chunkEmbedding(self, chunks):
        chunk_embeddings = []
        for chunk in chunks:
            tokens = self.tokenizer.tokenize(chunk)
            indexed_tokens = self.tokenizer.convert_tokens_to_ids(tokens)
            segments_ids = [1] * len(tokens)
            tokens_tensor = torch.tensor([indexed_tokens])
            segments_tensors = torch.tensor([segments_ids])
            with torch.no_grad():
                outputs = self.bert_model(tokens_tensor, segments_tensors)
            chunk_embeddings.append(outputs[0][0][0].numpy())
        return chunk_embeddings

    #Function to calculate and return BERT score. 
    def calculate_bert_score(self, query):
        shared_utils.logger.info("Query")
        shared_utils.logger.info(query)
        query_embedding = self.calculate_bert_embedding([{"title": query, "body": ""}], True)
        scores = []
        for index, doc in enumerate(self.docArray):
            scores.append(0.0)
            if shared_utils.bert_field_weight:
                similarity = {"title": self.calculate_cosine_similarity(query_embedding, doc["embedding"]["title"])
                              ,"body": self.calculate_cosine_similarity(query_embedding, doc["embedding"]["body"])}
            else:
                similarity = self.calculate_cosine_similarity(query_embedding, doc["embedding"])

            counter = 0
            document_length = 0
            for field in doc:
                counter += 1
                if counter > shared_utils.nr_of_fields:
                    break
                document_length += len(doc[field][0])
            if shared_utils.bert_field_weight:
                normalized_bert_score = {
                    "title": self.calculateNormalizredBert(similarity["title"], len(doc["title"][0]), self.field_weights["title"]),
                    "body": self.calculateNormalizredBert(similarity["body"], len(doc["body"][0]), self.field_weights["body"])
                }
            else:
                normalized_bert_score = self.calculateNormalizredBert(similarity, document_length)
            shared_utils.logger.info("document Length: " + str(document_length) + "   similarity: " + str(similarity) + "   Normalized Score: " + str(normalized_bert_score))
            if shared_utils.bert_field_weight:
                for i, field in enumerate(doc):
                    if i >= shared_utils.nr_of_fields:
                        break
                    field_weight = self.field_weights[field]
                    scores[index] += field_weight * normalized_bert_score[field]
            else:
                scores[index] = normalized_bert_score
        return scores

    def calculateNormalizredBert(self, similarity, document_length, weight=1):
        #TODO Consider what the right formula is here
        # weight = 1
        return similarity / ( (document_length/(document_length*1.45+document_length**1.01)) * weight)
    
    
    #Function to calculate similairty between two non-empty vectors, which are the BERT embeddings of a query and document.
    def calculate_cosine_similarity(self, vector1, vector2):
        dot_product = sum(a * b for a, b in zip(vector1, vector2))
        magnitude1 = math.sqrt(sum(a**2 for a in vector1))
        magnitude2 = math.sqrt(sum(b**2 for b in vector2))
        if magnitude1 == 0 or magnitude2 == 0:
            return 0.0
        return dot_product / (magnitude1 * magnitude2)

    #Function which ranks docArray using both BM25F and BERT in a combined score, and appends it to each document.
    def rank_documents_BM25AndBert(self, query, docArray, split_documents):
        document_scores = []
        scores_bert = self.calculate_bert_score(query)
        for index, document in enumerate(docArray):
            total_score_bm25f = 0.0
            score_bm25f = self.calculate_bm25f_score(query, split_documents[index])
            total_score_bm25f += score_bm25f

            # Calculate BERT score for the entire query
            shared_utils.logger.info("Scores")
            shared_utils.logger.info(total_score_bm25f)
            shared_utils.logger.info(scores_bert[index])
            # Combine BM25F and BERT scores
            combined_score = scores_bert[index]#total_score_bm25f# + scores_bert[index]
            document_scores.append((document, combined_score))
        # Sort docArray based on the combined score in descending order
        ranked_docArray = sorted(document_scores, key=lambda x: x[1], reverse=True)[:10]
        return ranked_docArray
