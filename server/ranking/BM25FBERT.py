import math 
from collections import Counter
from transformers import BertModel, BertTokenizer
import torch
import numpy as np
import sys
import http.server
import socketserver
import json
from urllib.parse import parse_qs
import unittest

class RequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Parse the query parameter from the request
        query_params = parse_qs(self.path[2:])
        query = query_params.get('query', [''])[0]

        # Handle the ranking request
        ranking_handler = Ranking()
        result = ranking_handler.handle_request(query)

        # Send the response
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()

        # Convert the result to JSON and send it
        response = json.dumps(result).encode('utf-8')
        self.wfile.write(response)

#File contains both the class BM25F and BM25FBERT. BM25FBERT is a subclass of BM25F, but it is possible to rewrite the class to not inherit from BM25F. However, BM25F is kept as a complete class incase future work needs it. Same goes for function to score documents.
class BM25F:
    #Initialize BM25F to be used for function calculate_bm25f_score in the class. Tweak k1 and b for better performing BM25F.
    def __init__(self, documents, field_weights):
        self.documents = documents
        self.documents_count = len(documents)
        self.avg_field_lengths = self.calculate_avg_field_lengths()
        self.term_counts = self.calculate_term_counts()
        self.k1 = 2
        self.b = 1
        self.field_weights = field_weights

    #Calculates avgerage field lengths, which is needed to calculate denominator used for score calculation
    def calculate_avg_field_lengths(self):
        avg_field_lengths = {}
        for field in self.documents[0].keys():
            total_length = sum(len(doc[field]) for doc in self.documents)
            avg_field_lengths[field] = total_length / self.documents_count
        return avg_field_lengths

    #Calculates how many times the term appears in the document. Term count is needed to calculate inverted document frequency
    def calculate_term_counts(self):
        term_counts = Counter()
        for document in self.documents:
            for field in document:
                term_counts.update(document[field])
        return term_counts

    #Simple function that returns inverted document frequency
    def calculate_idf(self, term):
        document_with_term_count = self.term_counts[term]
        return math.log((self.documents_count - document_with_term_count + 0.5) / (document_with_term_count + 0.5) + 1.0)

    #Function which splits a string so that BM25F can search the document for each keyword in query
    def bm25f_query_split(self, query):
        query_string = query[0]
        query_words = query_string.split()
        return query_words
    
    #Function which splits the document so that BM25F can properly search the document for each keyword
    def bm25f_document_split(self, document):
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
        document = self.bm25f_document_split(document)
        query = self.bm25f_query_split(query)
        score = 0.0
        document_lengths = {field: len(document[field]) for field in document}
        query_terms = Counter(query)
        for term in query_terms:
            idf = self.calculate_idf(term)
            for field in document:
                if term not in document[field]:
                    continue
                term_frequency = document[field].count(term)
                numerator = term_frequency * (self.k1 + 1)
                denominator = term_frequency + self.k1 * (1 - self.b + self.b * (document_lengths[field] / self.avg_field_lengths[field]))
                score += self.field_weights[field] * idf * (numerator / denominator)
        return score

    #Function which appends each document with BM25F score.
    def rank_documents(self, query):
        document_scores = []
        for document in self.documents:
            score = self.calculate_bm25f_score(query, document)
            document_scores.append((document, score))
        ranked_documents = sorted(document_scores, key=lambda x: x[1], reverse=True)
        return ranked_documents


class BM25F_and_BERT(BM25F):
    #Function which initializes BERT using bert-base-uncased as the BERT model.
    def __init__(self, documents, field_weights, bert_model_name="bert-large-uncased"):
        super().__init__(documents, field_weights)
        self.bert_model = BertModel.from_pretrained(bert_model_name)
        self.tokenizer = BertTokenizer.from_pretrained(bert_model_name)

    #Function which generate BERT embedding of a text. Used to generate BERT embedding of query and document.
    def calculate_bert_embedding(self, documents):
        # Combine title and body into a single string for each document
        document_texts = [" ".join(doc["title"] + doc["body"]) for doc in documents]
        # Tokenize and calculate BERT embedding for each document
        embeddings = []
        for text in document_texts:
            # Split text into chunks of max_seq_length tokens
            max_seq_length = self.tokenizer.model_max_length
            chunks = [text[i:i+max_seq_length] for i in range(0, len(text), max_seq_length)]
            # Calculate BERT embedding for each chunk
            chunk_embeddings = []
            for chunk in chunks:
                tokens = self.tokenizer.tokenize(self.tokenizer.decode(self.tokenizer.encode(chunk)))
                indexed_tokens = self.tokenizer.convert_tokens_to_ids(tokens)
                segments_ids = [1] * len(tokens)
                tokens_tensor = torch.tensor([indexed_tokens])
                segments_tensors = torch.tensor([segments_ids])
                with torch.no_grad():
                    outputs = self.bert_model(tokens_tensor, segments_tensors)
                chunk_embeddings.append(outputs[0][0][0].numpy())
        # Aggregate embeddings for the entire document
        embeddings.append(np.mean(chunk_embeddings, axis=0))
        return embeddings
    

    #Function to calculate and return BERT score. 
    def calculate_bert_score(self, query, document):
        query_embedding = self.calculate_bert_embedding([{"title": query, "body": []}])[0]
        document_embedding = self.calculate_bert_embedding([document])[0]
        score = 0.0
        # Calculate cosine similarity between query and document embeddings
        similarity = self.calculate_cosine_similarity(query_embedding, document_embedding)
        # Normalize BERT score based on the length of the document
        document_length = sum(len(document[field]) for field in document)
        normalized_bert_score = similarity / document_length
        for field in document:
            field_weight = self.field_weights.get(field, 1.0)
            score += field_weight * normalized_bert_score
        return score


    #Function to calculate similairty between two non-empty vectors, which are the BERT embeddings of a query and document.
    def calculate_cosine_similarity(self, vector1, vector2):
        dot_product = sum(a * b for a, b in zip(vector1, vector2))
        magnitude1 = math.sqrt(sum(a**2 for a in vector1))
        magnitude2 = math.sqrt(sum(b**2 for b in vector2))
        if magnitude1 == 0 or magnitude2 == 0:
            return 0.0
        return dot_product / (magnitude1 * magnitude2)

    #Function which ranks documents using both BM25F and BERT in a combined score, and appends it to each document.
    def rank_documents_bert(self, query, documents=None):
        if documents is None:
            documents = self.documents
        document_scores = []
        for document in documents:
            total_score_bm25f = 0.0
            # Calculate BM25F score for each word in the query
            for word in query:
                score_bm25f = self.calculate_bm25f_score([word], document)
                total_score_bm25f += score_bm25f
            # Calculate BERT score for the entire query
            score_bert = self.calculate_bert_score(query, document)
            # Combine BM25F and BERT scores
            combined_score = total_score_bm25f + score_bert
            document_scores.append((document, combined_score))
        # Sort documents based on the combined score in descending order
        ranked_documents = sorted(document_scores, key=lambda x: x[1], reverse=True)
        return ranked_documents
    
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
            # Ensure the document has the expected fields
            self.assertIn("title", doc)
            self.assertIn("body", doc)
            # Ensure the document is a dictionary
            self.assertIsInstance(doc, dict)
            # Ensure the score is a float
            self.assertIsInstance(score, float)
            print("This is the unit test running")

def Trim(n):
        doc, score = n
        return {"URL": doc.get("URL"), "Title": doc.get("title"), "Score": score}   
class Ranking:
    def __init__(self):
        self.field_weights = {"title": 0.05, "body": 0.95}
        #Load search query from SPOIdentifier.py and splits into individual words
        query = ["Who served as first lady of the United States in 2021?"]
        
        self.documents = [{"title": ["Barack Obama"], "body": ["Barack Hussein Obama II is an American politician who served as the 44th president of the United States from 2009 to 2017. A member of the Democratic Party, he was the first African-American president. Obama previously served as a U.S. senator representing Illinois from 2005 to 2008, as an Illinois state senator from 1997 to 2004, and as a civil rights lawyer and university lecturer. Obama was born in Honolulu, Hawaii. He graduated from Columbia University in 1983 with a B.A. in political science and later worked as a community organizer in Chicago. In 1988, Obama enrolled in Harvard Law School, where he was the first black president of the Harvard Law Review. He became a civil rights attorney and an academic, teaching constitutional law at the University of Chicago Law School from 1992 to 2004. He also went into elective politics. Obama represented the 13th district in the Illinois Senate from 1997 until 2004, when he successfully ran for the U.S. Senate. In 2008, after a close primary campaign against Hillary Clinton, he was nominated by the Democratic Party for president and chose Joe Biden as his running mate. Obama was elected president, defeating Republican nominee John McCain in the presidential election and was inaugurated on January 20, 2009. Nine months later he was named the 2009 Nobel Peace Prize laureate, a decision that drew a mixture of praise and criticism. Obama's first-term actions addressed the global financial crisis and included a major stimulus package to guide the economy to recover from the Great Recession, a partial extension of George W. Bush's tax cuts, legislation to reform health care, a major financial regulation reform bill, and the end of a major U.S. military presence in Iraq. Obama also appointed Supreme Court justices Sonia Sotomayor and Elena Kagan, the former being the first Hispanic American on the Supreme Court. He ordered the counterterrorism raid which killed Osama bin Laden and downplayed Bush's counterinsurgency model, expanding air strikes and making extensive use of special forces while encouraging greater reliance on host-government militaries. Obama also ordered military involvement in Libya in order to implement UN Security Council Resolution 1973, contributing to the overthrow of Muammar Gaddafi. After winning re-election by defeating Republican opponent Mitt Romney, Obama was sworn in for a second term on January 20, 2013. In his second term, Obama took steps to combat climate change, signing a major international climate agreement and an executive order to limit carbon emissions. Obama also presided over the implementation of the Affordable Care Act and other legislation passed in his first term, and he negotiated a nuclear agreement with Iran and normalized relations with Cuba. The number of American soldiers in Afghanistan fell dramatically during Obama's second term, though U.S. soldiers remained in the country throughout Obama's presidency. Obama promoted inclusion for LGBT Americans, culminating in the Supreme Court's decision to strike down same-sex marriage bans as unconstitutional in Obergefell v. Hodges. Obama left office on January 20, 2017, and continues to reside in Washington, D.C. His presidential library in Chicago began construction in 2021. Since leaving office, Obama has remained active in Democratic politics, including campaigning for candidates in various American elections, such as his former vice president Joe Biden in his successful bid for president in 2020. Outside of politics, Obama has published three bestselling books: Dreams from My Father (1995), The Audacity of Hope (2006), and A Promised Land (2020). Rankings by scholars and historians, in which he has been featured since 2010, place him in the middle to upper tier of American presidents."]},
        {"title": ["Donald Trump"], "body": ["Donald John Trump (born June 14, 1946) is an American politician, media personality, and businessman who served as the 45th president of the United States from 2017 to 2021. Trump received a Bachelor of Science in economics from the University of Pennsylvania in 1968, and his father named him president of his real estate business in 1971. Trump renamed it the Trump Organization and expanded its operations to building and renovating skyscrapers, hotels, casinos, and golf courses. After a series of business reversals in the late twentieth century, he successfully launched side ventures. Trump won the 2016 presidential election as the Republican nominee against Democratic nominee Hillary Clinton while losing the popular vote. During the campaign, his political positions were described as populist, protectionist, isolationist, and nationalist. His election and policies sparked numerous protests. He was the first U.S. president with no prior military or government experience. The 2017-2019 special counsel investigation established that Russia had interfered in the 2016 election to favor Trump's campaign. Trump promoted conspiracy theories and made many false and misleading statements during his campaigns and presidency, to a degree unprecedented in American politics. Many of his comments and actions have been characterized as racially charged or racist and many as misogynistic. As president, Trump ordered a travel ban on citizens from several Muslim-majority countries, diverted military funding toward building a wall on the U.S.-Mexico border, and implemented a policy of family separations for migrants detained at the U.S. border. He weakened environmental protections, rolling back more than 100 environmental policies and regulations. He signed the Tax Cuts and Jobs Act of 2017, which cut taxes for individuals and businesses and rescinded the individual health insurance mandate penalty of the Affordable Care Act. He appointed Neil Gorsuch, Brett Kavanaugh, and Amy Coney Barrett to the U.S. Supreme Court. Trump initiated a trade war with China and withdrew the U.S. from the proposed Trans-Pacific Partnership trade agreement, the Paris Agreement on climate change, and the Iran nuclear deal. He met with North Korean leader Kim Jong Un three times but made no progress on denuclearization. He reacted slowly to the COVID-19 pandemic, ignored or contradicted many recommendations from health officials, used political pressure to interfere with testing efforts, and spread misinformation about unproven treatments. Trump lost the 2020 presidential election to Joe Biden. He refused to concede defeat, falsely claiming widespread electoral fraud, and attempted to overturn the results by pressuring government officials, mounting scores of unsuccessful legal challenges, and obstructing the presidential transition. On January 6, 2021, he urged his supporters to march to the U.S. Capitol, which many of them then attacked, resulting in multiple deaths and interrupting the electoral vote count. Trump is the only American president to have been impeached twice. After he tried to pressure Ukraine in 2019 to investigate Biden, he was impeached by the House of Representatives for abuse of power and obstruction of Congress; he was acquitted by the Senate in February 2020. The House impeached him again in January 2021, for incitement of insurrection, and the Senate acquitted him in February. Scholars and historians rank Trump as one of the worst presidents in American history. Since leaving office, Trump has remained heavily involved in the Republican Party. In November 2022, he announced his candidacy for the Republican nomination in the 2024 presidential election. In March 2023, a Manhattan grand jury indicted him on 34 felony counts of falsifying business records. In June, a Miami federal grand jury indicted him on 40 felonies related to his handling of classified documents. In August, a Washington, D.C., federal grand jury indicted him on four felony counts of conspiracy and obstruction related to efforts to overturn the 2020 election. Later in August, a Fulton County, Georgia, grand jury indicted him on 19 charges of racketeering and other felonies committed in an effort to overturn the state's 2020 election results. Trump pleaded not guilty to all charges."]},
        {"title": ["George W. Bush"], "body": ["George Walker Bush (born July 6, 1946) is an American politician who served as the 43rd president of the United States from 2001 to 2009. A member of the Republican Party, he previously served as the 46th governor of Texas from 1995 to 2000. The eldest son of the 41st president George H. W. Bush and a member of the Bush family, he flew warplanes in the Texas Air National Guard in his twenties. After graduating from Harvard Business School in 1975, he worked in the oil industry. He later co-owned the Texas Rangers of Major League Baseball before being elected governor of Texas in 1994. As governor, Bush successfully sponsored legislation for tort reform, increased education funding, set higher standards for schools, and reformed the criminal justice system. He also helped make Texas the United States' leading producer of wind-powered electricity. In the 2000 United States presidential election, he won over Democratic incumbent Vice President Al Gore, despite losing the popular vote after a narrow and contested Electoral College win that involved a Supreme Court decision to stop a recount in Florida. Upon taking office, Bush signed a major tax cut program and an education reform bill, the No Child Left Behind Act. He pushed for socially conservative efforts such as the Partial-Birth Abortion Ban Act and faith-based initiatives. He also initiated the President's Emergency Plan for AIDS Relief in 2003 to address the AIDS epidemic. A decisive event that reshaped his administration was the terrorist attacks on September 11, 2001, resulting in the start of the war on terror and the creation of the Department of Homeland Security. Bush ordered the 2001 invasion of Afghanistan in an effort to overthrow the Taliban, destroy al-Qaeda, and capture Osama bin Laden. He signed the Patriot Act to authorize surveillance of suspected terrorists. He also ordered the 2003 invasion of Iraq on the erroneous beliefs that Saddam Hussein's regime possessed weapons of mass destruction and developed ties with al-Qaeda. Hussein was nevertheless overthrown and captured by American forces. Bush later signed the Medicare Modernization Act, which created Medicare Part D. In 2004, Bush was narrowly reelected president, beating Democratic opponent John Kerry and winning the popular vote. During his second term, Bush reached multiple free trade agreements. He appointed John Roberts and Samuel Alito to the Supreme Court. He sought major changes to Social Security and immigration laws, but both efforts failed in Congress. Bush was widely criticized for his handling of Hurricane Katrina and the midterm dismissal of U.S. attorneys. Amid his unpopularity, the Democrats regained control of Congress in the 2006 elections. The Afghanistan and Iraq wars continued, and, in January 2007, Bush launched a surge of troops in Iraq. By December, the U.S. entered the Great Recession, prompting the Bush administration to obtain congressional approval for multiple economic programs intended to preserve the country's financial system, including the Troubled Asset Relief Program. After finishing his second term, Bush returned to Texas, where he has maintained a low profile since leaving office. At various points in his presidency, he was among both the most popular and unpopular presidents in U.S. history. He received the highest recorded approval ratings in the wake of the September 11 attacks, but also one of the lowest such ratings during the 2007-2008 financial crisis. Although public opinion of Bush has improved since he left office, his presidency has generally been rated as below-average by scholars."]},
        {"title": ["Joe Biden"], "body": ["Joseph Robinette Biden Jr. ( born November 20, 1942) is an American politician who is the 46th and current president of the United States. Ideologically a moderate member of the Democratic Party, he previously served as the 47th vice president from 2009 to 2017 under President Barack Obama and represented Delaware in the United States Senate from 1973 to 2009. Born in Scranton, Pennsylvania, Biden moved with his family to Delaware in 1953. He studied at the University of Delaware before earning his law degree from Syracuse University. He was elected to the New Castle County Council in 1970 and to the U.S. Senate in 1972. As a senator, Biden drafted and led the effort to pass the Violent Crime Control and Law Enforcement Act and the Violence Against Women Act. He also oversaw six U.S. Supreme Court confirmation hearings, including the contentious hearings for Robert Bork and Clarence Thomas. Biden ran unsuccessfully for the Democratic presidential nomination in 1988 and 2008. In 2008, Obama chose Biden as his running mate, and Biden was a close counselor to Obama during his two terms as vice president. In the 2020 presidential election, Biden and his running mate, Kamala Harris, defeated incumbents Donald Trump and Mike Pence. Biden is the second Catholic president in U.S. history (after John F. Kennedy), and his politics have been widely described as profoundly influenced by Catholic social teaching. Taking office at age 78, Biden is the oldest president in U.S. history and the first to have a female vice president. In 2021, he signed a bipartisan infrastructure bill, as well as a $1.9 trillion economic stimulus package in response to the COVID-19 pandemic and its related recession. Biden proposed the Build Back Better Act, which failed in Congress, but aspects of which were incorporated into the Inflation Reduction Act that was signed into law in 2022. Biden also signed the bipartisan CHIPS and Science Act, which focused on manufacturing, appointed Ketanji Brown Jackson to the Supreme Court, and worked with congressional Republicans to prevent a first-ever national default by negotiating a deal to raise the debt ceiling. In foreign policy, Biden restored America's membership in the Paris Agreement. He oversaw the complete withdrawal of U.S. troops from Afghanistan that ended the war in Afghanistan, during which the Afghan government collapsed and the Taliban seized control. Biden has responded to the Russian invasion of Ukraine by imposing sanctions on Russia and authorizing civilian and military aid to Ukraine. During the 2023 Israel-Hamas war, Biden announced American military support for Israel and condemned the actions of Hamas and other Palestinian militants as terrorism. In April 2023, he announced his candidacy for the Democratic Party nomination in the 2024 presidential election."]},
        {"title": ["Michelle Obama"], "body": ["Michelle LaVaughn Robinson Obama (born January 17, 1964) is an American attorney and author who served as the first lady of the United States from 2009 to 2017, being married to former president Barack Obama. Raised on the South Side of Chicago, Obama is a graduate of Princeton University and Harvard Law School. In her early legal career, she worked at the law firm Sidley Austin where she met her future husband. She subsequently worked in nonprofits and as the associate dean of Student Services at the University of Chicago. Later, she served as vice president for Community and External Affairs of the University of Chicago Medical Center. Michelle married Barack in 1992, and they have two daughters. Obama campaigned for her husband's presidential bid throughout 2007 and 2008, delivering a keynote address at the 2008 Democratic National Convention. She has subsequently delivered acclaimed speeches at the 2012, 2016, and 2020 conventions. As the first lady, Obama served as a role model for women and worked as an advocate for poverty awareness, education, nutrition, physical activity, and healthy eating. She supported American designers and was considered a fashion icon. Obama was the first African-American woman to serve as the first lady. After her husband's presidency, Obama's influence has remained high. In 2020, she topped Gallup's poll of the most admired woman in America for the third year running."]},
        {"title": ["Jill Biden"], "body": ["Jill Tracy Jacobs Biden (née Jacobs; born June 3, 1951) is an American educator who has been the first lady of the United States since 2021 as the wife of President Joe Biden. She was the second lady of the United States from 2009 to 2017 when her husband was vice president. Since 2009, Biden has been a professor of English at Northern Virginia Community College and is believed to be the first wife of a vice president or president to hold a salaried position during her husband's tenure. She has a bachelor's degree in English from the University of Delaware, master's degrees in education and English from West Chester University and Villanova University, and returned to the University of Delaware for a doctoral degree in education. She taught English and reading in high schools for thirteen years and instructed adolescents with emotional disabilities at a psychiatric hospital. Then, for fifteen years, she was an English and writing instructor at Delaware Technical & Community College. Born in Hammonton, New Jersey, she grew up in Willow Grove, Pennsylvania. She married Joe Biden in 1977, becoming the stepmother of Beau and Hunter, two sons from Joe Biden's first marriage. Biden and her husband also have a daughter together, Ashley Biden, born in 1981. She is the founder of the Biden Breast Health Initiative non-profit organization, co-founder of the Book Buddies program, co-founder of the Biden Foundation, is active in Delaware Boots on the Ground, and with Michelle Obama is co-founder of Joining Forces. She has published a memoir and two children's books."]},
        {"title": ["Melania Trump"], "body": ["Melania Trump (born April 26, 1970) is a Slovenian-American former model and businesswoman who served as the first lady of the United States from 2017 to 2021, as the wife of former president Donald Trump. Melania Trump grew up in Slovenia (then part of Yugoslavia) and worked as a fashion model through agencies in the European fashion capitals of Milan and Paris before moving to New York City in 1996. She was represented by Irene Marie Models and Trump Model Management. In 2005, she married the real estate developer and TV personality Donald Trump and gave birth to their son Barron in 2006. Later that year, she became an American naturalized citizen. She is the second naturalized woman—after Louisa Adams—and the first non-native English speaker to become First Lady. Since the end of her husband's presidency, Trump has chosen a more private life, according to those close to her."]},
        {"title": ["Laura Bush"], "body": ["Laura Lane Bush (née Welch; born November 4, 1946) is the wife of George W. Bush and served as the first lady of the United States from 2001 to 2009. Bush previously served as the first lady of Texas from 1995 to 2000. She is also the daughter-in-law of former president George H. W. Bush. Born in Midland, Texas, Bush graduated from Southern Methodist University in 1968 with a bachelor's degree in education, and took a job as a second grade teacher. After attaining her master's degree in library science at the University of Texas at Austin, she was employed as a librarian. Bush met her future husband, George W. Bush, in 1977, and they were married later that year. The couple had twin daughters in 1981. Bush's political involvement began during her marriage. She campaigned with her husband during his unsuccessful 1978 run for the United States Congress, and later for his successful Texas gubernatorial campaign. As First Lady of Texas, Bush implemented many initiatives focused on health, education, and literacy. In 1999-2000, she aided her husband in campaigning for the presidency in a number of ways, such as delivering a keynote address at the 2000 Republican National Convention, which gained her national attention. She became First Lady after her husband was inaugurated as president on January 20, 2001. Polled by The Gallup Organization as one of the most popular First Ladies, Bush was involved in national and global concerns during her tenure.[5] She continued to advance her trademark interests of education and literacy by establishing the annual National Book Festival in 2001,[6] and encouraged education on a worldwide scale. She also advanced women's causes through The Heart Truth and Susan G. Komen for the Cure organizations. She represented the United States during her foreign trips, which tended to focus on HIV/AIDS and malaria awareness. She is the oldest living former First Lady, following the death of Rosalynn Carter in 2023."]},
        ]

        self.bm25f_bert_instance = BM25F_and_BERT(self.documents, self.field_weights)
        result = self.bm25f_bert_instance.rank_documents_bert(query, self.documents)

        test_instance = TestBM25FBERT()

        test_instance.test_rank_documents_with_bert(result)       
        combined_json_top_10_results = map(Trim, result[0:10])
        return combined_json_top_10_results
    def handle_request():



class RankingHandler:
    def __init__(self):
        self.ranking_instance = Ranking()

    def handle_request(self, query):
        result = self.ranking_instance.bm25f_bert_instance.rank_documents_bert([query])
        combined_json_top_10_results = map(self.Trim, result[0:10])
        return list(combined_json_top_10_results)

    @staticmethod
    def Trim(item):
        doc, score = item
        return {"URL": doc.get("URL"), "Title": doc.get("title"), "Score": score}

if __name__ == "__main__":
    port = 6969
    directory = '.'

    with socketserver.TCPServer(("", port), RequestHandler) as httpd:
        print(f"Serving on port {port}")

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer terminated by user.")
