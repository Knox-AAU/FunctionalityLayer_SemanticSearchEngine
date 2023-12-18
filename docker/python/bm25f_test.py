from bm25f import BM25F
import unittest

# self.docArray.append({
#     "title": row[0],
#     "body": file.read(),
#     "url": row[1],
#     "pdfPath": row[2],
#     "timeStamp": row[5]
# })

print("HELLO Testers")

class unitTesterClass(unittest.TestCase):
    docArray = [
         {
            "title": ["Barack Obama"],
            "body": ["Michelle Obama is husband and has been living in the whitehouse in washinton for a long time"]
        },
        
        # 24 x gotham , 0 x total
        {
            "title": ["villains"],
            "body":["Gotham City Gotham Gotham Gotham Gotham Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City has 2003 villains, and it is remarkable that every single civilian living in gotham has not just moved out already."]        
        },
        
        # 20 x gotham ,  2 x total
        {
            "title": ["villains"],
            "body":["Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City has a total of 2003 villains, and it is total remarkable that every single civilian living in gotham has not just moved out already."]        
        }
    ]
    BM25FInstance = BM25F(docArray, {"title": 0.5, "body": 0.5})

    def testInit(self):
        assert(self.docArray)
        assert(self.BM25FInstance)
        assert(self.BM25FInstance.documents_count > 0)
    
    def testIdf(self):
        actualIdf = self.BM25FInstance.calculate_idf("michelle", "body", 0)
        #print(actualIdf)
        assert(actualIdf) == 0.9808292530117263

    def testCalculateBM25FScore(self):
        query = "is"
        document = self.docArray[1]  # Choosing the second document for testing
        expected_score = 0.0  # Set the expected score based on your calculation
        actual_score = self.BM25FInstance.calculate_bm25f_score(query, document)
        print(actual_score)
        print("bm25f Actual score: " +str(actual_score))
        assert(actual_score == expected_score)
 
        
        
        
if __name__ == '__main__':
    unittest.main()