from bm25f import BM25F
import unittest


class unitTesterClass(unittest.TestCase):
    docArray = [
        
         { 
            "title": "Barack Obama",
            "body": "Michelle Obama is husband wordisonceinalldocs wordisoncehere wordistwicehere wordisthricehere wordisfourthhere and has been living in the whitehouse in washinton for a long time"
        },
        
        # 24 x gotham , 0 x total
        {
            "title": "villains",
            "body":"Gotham City Gotham Gotham wordisonceinalldocs duofactor solofactor Gotham Gotham Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City has 2003 villains, and it is remarkable that every single civilian living in gotham has not just moved out already."        
        },
        
        # 20 x gotham ,  2 x total
        {
            "title": "villains",
            "body":"Gotham City Gotham City wordisonceinalldocs Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City has a total of 2003 villains, and it is total remarkable that every single civilian living in gotham has not just moved out already."        
        }
    ]
    BM25FInstance = BM25F(docArray, {"title": 1, "body": 1})


    def testInit(self):
        assert(self.docArray)
        assert(self.BM25FInstance)
        assert(self.BM25FInstance.documents_count > 0)
    
    #  def calculate_idf(self, term, field, index):
    
    def testIdf(self):
        actualIdf = self.BM25FInstance.calculate_idf("michelle")
        #print(actualIdf)
        assert(actualIdf) == 0.9808292530117263

        
        
        
if __name__ == '__main__':
    unittest.main()