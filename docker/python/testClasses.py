import unittest

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