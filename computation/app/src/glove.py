from gensim.models.keyedvectors import KeyedVectors
from autocorrect import Speller
from json_tricks import dumps
import spacy

from numpy import mean as np_mean
from scipy.spatial.distance import cosine

nlp = spacy.load("en_core_web_sm")

model_location = "./models/glove.6B.50d.txt"
spell = Speller()

def similarity(a, b):
    sim = 1 - cosine(a, b)
    return sim

class GloveDic():
    model = None
    misses = []

    def __init__(self):
        print("Loading GloVe dictionary...")
        self.model = KeyedVectors.load_word2vec_format(model_location, binary=False)
        print("Dictionary loaded successfully.")

    def lookup(self, word, autocorrect=False, http=False):
        vect = None
        httpRes = None
        if word.lower() in self.model:
            vect = self.model[word.lower()]
            httpRes = {
                "word": word,
                "vect": vect
            }
        elif autocorrect is True and spell(word.lower()) in self.model:
            vect = self.model[spell(word.lower())]
            httpRes = {
                "word": word,
                "autocorrect": spell(word.lower()),
                "vect": vect
            }
        else:
            self.misses.append(word)
            httpRes = {
                "word": word,
                "vect": None
            }

        res = vect
        if http is True:
            res = dumps(httpRes)
        return res

    def resetMisses(self):
        self.misses = []

    def sentLookup(self, sent, http=False):
        vectors = None
        if isinstance(sent, list):
            vectors = [self.lookup(token, autocorrect=True, http=False) for token in sent]
        else:
            ##tokenize the sentence
            tokens = nlp(sent)
            ##using list comprehension to obtain the vectors for each word
            vectors = [self.lookup(token.text, autocorrect=True, http=False) for token in tokens]
        ##replacing nones with 0s
        vectors = [vect if vect is not None else 0 for vect in vectors]
        ##averaging the vectors
        res = np_mean(vectors, axis=0)
        if http is True:
            ##json preparation for HTTP protocol
            temp = {'sent': sent,
                    'vector': res}
            res = dumps(temp)
        return res

    def calcSims(self, source, summary):
        res = {}

        for summary_idx, summary_iu in summary["ius"].items():
            sims = []
            summary_vect = self.sentLookup(summary_iu)
            #print("sum_vect")
            #print(summary_vect)
            for source_idx, source_iu in source["ius"].items():
                source_vect = self.sentLookup(source_iu)
                sim = similarity(summary_vect, source_vect)
                sims.append([summary_idx, source_idx, sim])
            res[summary_idx] = sorted(sims, reverse=True, key=lambda data: data[2])
        return res
