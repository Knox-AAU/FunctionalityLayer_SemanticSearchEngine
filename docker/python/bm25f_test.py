from bm25f import BM25F
import unittest

# self.docArray.append({
#     "title": [row[0]],
#     "body": [file.read()],
#     "url": row[1],
#     "pdfPath": row[2],
#     "timeStamp": row[5]
# })

print("HELLO Testers")

class unitTesterClass(unittest.TestCase):
    docArray = [
        {
            "title": ["Barack Obama"],
            "body": ["Michelle Obama husband"]
        },
        {
            "title": ["Bruce Wayne"],
            "body":["Gotham City, shrouded in darkness, faced a new threat. The notorious villain, Riddler, unleashed a series of mind-bending puzzles across the city. As chaos ensued, Commissioner Gordon turned to the shadows for help. Silently, Batman emerged from the shadows, his cape billowing in the night wind. With his brilliant mind and unparalleled detective skills, he deciphered the intricate riddles, leading him to the heart of Riddler\'s lair. In a pulse-pounding confrontation, Batman outsmarted the Riddler's traps and confronted the villain. As the Bat-Signal pierced the sky, signaling justice restored, Gotham City sighed in relief, knowing that as long as there were shadows, the Dark Knight would be there to protect them"]        
        }
    ]
    BM25FInstance = BM25F(docArray, {"title": 0.5, "body": 0.5})

    def testInit(self):
        assert(self.docArray)
        assert(self.BM25FInstance)
        assert(self.BM25FInstance.documents_count > 0)
    
    def testIdf(self):
        print(self.BM25FInstance.calculate_idf("obama", "body", 1))
        assert(self.BM25FInstance.calculate_idf("michelle", "body", 0) == 0.4010299957)

    
if __name__ == '__main__':
    unittest.main()