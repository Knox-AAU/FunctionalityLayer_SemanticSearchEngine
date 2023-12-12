import math
from collections import Counter
import logging
import math 

class BM25F:
    #Initialize BM25F to be used for function calculate_bm25f_score in the class. Tweak k1 and b for better performing BM25F.
    def __init__(self, docArray, field_weights):
        self.docArray = docArray
        self.documents_count = len(docArray)
        self.avg_field_lengths = self.calculate_avg_field_lengths()
        self.term_counts = self.calculate_term_counts()
        self.k1 = 2
        self.b = 100
        self.field_weights = field_weights

    #Calculates avgerage field lengths, which is needed to calculate denominator used for score calculation
    def calculate_avg_field_lengths(self):
        global nr_of_fields
        avg_field_lengths = {}
        counter = 0
        for field in self.docArray[0].keys():
            counter += 1
            if counter > nr_of_fields:
                break
            total_length = sum(len(doc[field]) for doc in self.docArray)
            avg_field_lengths[field] = total_length / self.documents_count
        return avg_field_lengths

    #Calculates how many times the term appears in the document. Term count is needed to calculate inverted document frequency
    def calculate_term_counts(self):
        global nr_of_fields
        term_counts_array = []
        for document in self.docArray:
            termCountsObject = {}
            for i, field in enumerate(document):
                term_counts = Counter()
                if i >= nr_of_fields:
                    break
                #for word in :
                lowercase = document[field][0].lower()
                term_counts.update(lowercase.split())
                termCountsObject[field] = term_counts
            term_counts_array.append(termCountsObject)
        return term_counts_array

    #Simple function that returns inverted document frequency
    def calculate_idf(self, term, field, index):
        document_with_term_count = self.term_counts[index][field][term]
        return math.log((self.documents_count - document_with_term_count + 0.5) / (document_with_term_count + 0.5) + 1.0) + 1.0

    #Function which splits a string so that BM25F can search the document for each keyword in query
    def query_splitter(self, query):
        return query.lower().split()
    
    #Function which splits the document so that BM25F can properly search the document for each keyword
    def bm25f_document_split(document):
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
        queryArray = self.query_splitter(query)
        score = 0.0
        document_lengths = {field: len(document[field]) for field in document}
        #query_terms = Counter(queryArray)
        for word in queryArray:
            for i, field in enumerate(document):
                if word not in self.term_counts[i][field]:
                    logger.info("Not in")
                    continue
                logger.info("in, idf:")
                idf = self.calculate_idf(word, field, i)
                logger.info(idf)
                if i >= nr_of_fields:
                    break
                term_frequency = document[field].count(word)
                numerator = term_frequency * (self.k1 + 1)
                denominator = term_frequency + self.k1 * (1 - self.b + self.b * (document_lengths[field] / self.avg_field_lengths[field]))
                score += self.field_weights[field] * idf * (numerator / denominator)
                logger.info("BMF")
                logger.info("weight: " + str(self.field_weights[field]) + "   idf: " + str(idf) + "   numerator: " + str(numerator) + "   deno: " + str(denominator))
        return score
