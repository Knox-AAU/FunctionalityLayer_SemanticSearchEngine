from bm25f import BM25F
import unittest

print("HELLO Testers")

class unitTesterClass(unittest.TestCase):
    docArray = [
        
         { 
            "title": "Barack Obama",
            "body": "Michelle Obama is husband  obehfidksahsekfmsd wordisfourtere twodocsonce en living in the whitehouse in washinton for long time"
        },
        
        # 
        {
            "title": "shortstring",
            "body":"a very short document wordisonceinalldocs"        
        },
        
        # 20 x gotham ,  0 x total ,  50 x fif
        {
            "title": "villains1",
            "body":"wordisonceinalldocs wordisoncehere wordistwicehere wordistwicehere Wordisintwodocs three three three wordisonceinalldocs Gotham Gotham Cit Gotham City Gotham Wordisintwodocs City Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City Gotham Gotham Gotham Gotham Gotham City Gotham  Gotham fif fif fif fif fif fif fif fif fif fif fif fif fif fif fif fif fif fif fif fif fif fif fif fif fif fif fif fif fif fif fif fif fif fif fif fif fif fif fif fif fif fif fif fif fif fif fif fif fif fif mod lalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalal"        
        },
        # 20 x gotham ,  0 x total ,  51 x mod
        {
            "title": "villains2",
            "body":"wordisonceinalldocs wordisoncehere wordistwicehere wordistwicehere Wordisintwodocs three three three wordisonceinalldocs Gotham Gotham Cit Gotham City Gotham Wordisintwodocs City Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City Gotham Gotham Gotham Gotham Gotham  fif Gotham  Gotham mod mod mod mod mod mod mod mod mod mod mod mod mod mod mod mod mod mod mod mod mod mod mod mod mod mod mod mod mod mod mod mod mod mod mod mod mod mod mod mod mod mod mod mod mod mod mod mod mod mod mod lalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalalal"        
        }
    ]
    seconddocArray = [
        # 24 x gotham , 0 x total
        {
            "title": "villains",
            "body":"Gallominus Gotham Gotham Gotham wordisonceinalldocs Gotham Gotham Gotham Wordisintwodocs City Gotham City Gotham City Gotham City Gotham  Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City has 2003 villains, and it is twodocsonce hasn not just moved out already lalala"        
        },
        
        # 20 x gotham ,  2 x total
        {
            "title": "villains",
            "body":"Gallominus Gotham Gotham Gotham wordisonceinalldocs Wordisintwodocs City total total City Gotham City Gotham City Gotham  Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City Gotham City has 2003 villains, and it is twodocsonce hasn not just moved out already fillerfillerfillerfile"        
        },
        # 1 x total
         { 
            "title": "short Message",
            "body": "velociraptor total lalalalalalalalalalalalalala "
        },
         
        { 
            "title": "another Message",
            "body": "triceratops lalalalalalalalalalalalalalalalalalala"
        },
        
         { 
            "title": "Long Message",
            "body": "pterodactyle lalalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalal"
        },
        { 
            "title": "kilo Message",
            "body": "tyranosaurus lalalalalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalallalalalalalalalalalalalalalalalalal"
        }
    ]
    
    
    BM25FInstance_database_1 = BM25F(docArray, {"title": 1, "body": 1})
    BM25FInstance_database_2 = BM25F(seconddocArray, {"title": 1, "body": 1})

    def testInit(self):
        assert(self.seconddocArray)
        assert(self.BM25FInstance_database_1)
        assert(self.BM25FInstance_database_1.documents_count > 0)
        assert(self.BM25FInstance_database_2)
        assert(self.BM25FInstance_database_2.documents_count > 0)

    tests = [
   ###format: query,       docindex, Database, expected_score, tolerance, bmfinstance########  
        # tests for term frequency
        [ "wordisoncehere", 2,      docArray,     0.5602,      0.0001, BM25FInstance_database_1],
        [ "wordistwicehere", 2,      docArray,     0.8466,     0.0001, BM25FInstance_database_1],
        [ "three",          2,      docArray,     1.0206,      0.0001, BM25FInstance_database_1],
        [ "fif",            2,      docArray,     1.6632,       0.0001, BM25FInstance_database_1],
        [ "mod",            3,      docArray,     1.6645,       0.0001, BM25FInstance_database_1],
        
        # tests for double term frequency
        [ "gotham total",   1,      seconddocArray,     4.1542,     0.0001,    BM25FInstance_database_2],
        [ "gotham",         0,      seconddocArray,     2.4692,     0.0001,    BM25FInstance_database_2],
        
        # tests for document length
        [ "velociraptor",      2,      seconddocArray,     2.1592,     0.0001,    BM25FInstance_database_2],
        [ "triceratops",      3,      seconddocArray,      2.1575,     0.0001,    BM25FInstance_database_2],
        [ "pterodactyle",      4,      seconddocArray,     1.0423,     0.0001,    BM25FInstance_database_2],
        [ "tyranosaurus",      5,      seconddocArray,     1.0415,     0.0001,    BM25FInstance_database_2],        
    ]

    def test(self):
        for test in self.tests:
            print("=========================\nstarting test: Query: " + str(test[0]) + "  docindex: " + str(test[1]) + "  Expected BMF: " + str(test[3]))
            testCalculateBM25FScore(test[0], test[1], test[2], test[3], test[4], test[5])
        
    


def testCalculateBM25FScore(query, index, docArray, expected_score, tolerance, instance):
    document = docArray[index]
    document["title"] = docArray[index]["title"].lower()
    document["body"] = docArray[index]["body"].lower()

    actual_score = instance.calculate_bm25f_score(query, document)
    print("the original query: " +str(query))
    print("bm25f Actual score: " +str(actual_score))
    assert(expected_score-tolerance < actual_score < expected_score+tolerance)
    
            
        
 
        
        
        
if __name__ == '__main__':
    unittest.main()