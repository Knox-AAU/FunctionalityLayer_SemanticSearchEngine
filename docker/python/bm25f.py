import math
from collections import Counter
import logging
import math 
import shared_utils


class BM25F:
    #Initialize BM25F to be used for function calculate_bm25f_score in the class. Tweak k1 and b for better performing BM25F.
    def __init__(self, docArray, field_weights):
        self.docArray = docArray
        self.documents_count = len(docArray)
        self.avg_field_lengths = self.calculate_avg_field_lengths()
        self.term_counts = self.calculate_term_counts()
        self.term_document_appearances = self.create_wordset_docArray()
        self.k1 = 2
        self.b = 100
        self.field_weights = field_weights

    #Calculates avgerage field lengths, which is needed to calculate denominator used for score calculation
    def calculate_avg_field_lengths(self):
        avg_field_lengths = {}
        counter = 0
        for field in self.docArray[0].keys():
            counter += 1
            if counter > shared_utils.nr_of_fields:
                break
            total_length = sum(len(doc[field][0]) for doc in self.docArray)
            avg_field_lengths[field] = total_length / self.documents_count
        return avg_field_lengths

    #Calculates how many times the term appears in the document. Term count is needed to calculate inverted document frequency
    def calculate_term_counts(self):
        term_counts_array = []
        for document in self.docArray:
            termCountsObject = {}
            for i, field in enumerate(document):
                term_counts = Counter()
                if i >= shared_utils.nr_of_fields:
                    break
                lowercase = document[field][0].lower()
                term_counts.update(lowercase.split())
                termCountsObject[field] = term_counts
            term_counts_array.append(termCountsObject)
        return term_counts_array
    
    #Creates an object with all the words in all the documents as key
    def create_wordset_docArray(self):
        # create a wordset containing all words in the docarray
        wordSet_DocArray = {}
        for document in self.docArray:            
            noRepeatWordDocSet = {}
            docString = ""
            # merges title and body into one string for convinience
            for i, field in enumerate(document.keys()):
                if(i >= shared_utils.nr_of_fields): break
                docString += document[field][0].lower() + " "
            words = docString.split()
            # if the word doesnt exist in the string, add the word to the string
            for word in words:
                if word not in noRepeatWordDocSet:
                    noRepeatWordDocSet[word] = True
                    if word in wordSet_DocArray:
                        wordSet_DocArray[word] += 1
                    else:
                        wordSet_DocArray[word] = 1
        return wordSet_DocArray
    
    # # Counts how many documents contain term
    # def count_documents_with_term2(self, term):
    #     count=0
    #     for document in self.docArray:
    #         if (term in document["body"][0] or term in document["title"][0]):
    #             count+=1
    #     return count
    
    
    def find(list, target):
        for word in list:
            if(word == target):
                return True
        return False
    #Simple function that returns inverted document frequency
    def calculate_idf(self, term, field, index):
        document_with_term_count = self.term_document_appearances[term]
        #document_with_term_count = self.term_counts[index][field][term]
        print("term " + term)


        print("documents_inTotal : " + str(self.documents_count) + " document_with_term_count:" + str(document_with_term_count))
        return math.log((self.documents_count - document_with_term_count + 0.5) / (document_with_term_count + 0.5) + 1.0) + 1.0

    #Function which splits a string so that BM25F can search the document for each keyword in query
    def query_splitter(self, query):
        return query.lower().split()
    
    #Function which splits the document so that BM25F can properly search the document for each keyword
    def bm25f_document_split(document):
        split_title = document["title"][0].lower().split()
        split_body = document["body"][0].lower().split()
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
        print("Document: " + str(document))
        document_lengths = {field: len(document[field][0]) for field in document}
        print("length of document: "+ str(document_lengths))
        print("avg length of documents: "+ str(self.avg_field_lengths))
        #query_terms = Counter(queryArray)
        for word in queryArray:
            for i, field in enumerate(document):
                if word not in self.term_counts[i][field]:
                    shared_utils.logger.info("Not in")
                    continue
                shared_utils.logger.info("in, idf:")
                idf = self.calculate_idf(word, field, i)
                print("idf: "+str(idf))
                shared_utils.logger.info(idf)
                if i >= shared_utils.nr_of_fields:
                    break
                term_frequency = document[field].count(word)
                numerator = term_frequency * (self.k1 + 1)
                denominator = term_frequency + self.k1 * (1 - self.b + self.b * (document_lengths[field] / self.avg_field_lengths[field]))
                score += self.field_weights[field] * idf * (numerator / denominator)
                shared_utils.logger.info("BMF")
                shared_utils.logger.info("weight: " + str(self.field_weights[field]) + "   idf: " + str(idf) + "   numerator: " + str(numerator) + "   deno: " + str(denominator))
        return score