from gensim.models.keyedvectors import KeyedVectors
from autocorrect import Speller
from json_tricks import dumps
import spacy

from numpy import mean as np_mean
from numpy import concatenate
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
        self.model = KeyedVectors.load_word2vec_format(
            model_location, binary=False)
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
            # tokenize the sentence
            tokens = nlp(sent)
            # using list comprehension to obtain the vectors for each word
            vectors = [self.lookup(token.text, autocorrect=True, http=False) for token in tokens]
        # replacing nones with 0s
        vectors = [vect if vect is not None else 0 for vect in vectors]
        # averaging the vectors
        res = np_mean(vectors, axis=0)
        if http is True:
            # json preparation for HTTP protocol
            temp = {'sent': sent,
                    'vector': res}
            res = dumps(temp)
        return res

    def extractPlaintextIUs(self, doc):
        '''
        This function prepares an array of plaintext words for each IU.
        This is done to prepare the docs for similarity calculation.
        '''
        ius = {}

        # Brace yourself for some ugly ass code
        # Sadly I could't find any other way to work around recursive JSON
        # than using indexes everywhere
        # Maybe this can be improved with maps somehow, but I think that with
        # maps the code would be even less legible

        # get the dictionary of IUS and iterate for its values (the IUs)
        for iu in doc.get("ius").values():
            # I only want to store the words for each IU.
            # here is the temp array for them
            word_collection = []
            # Ius are composed of 1 or more segments
            # get the dic of childsegments and iterate for its values
            # (the seg idx in the doc structure)
            for seg_idx in iu.get("childSegs").values():
                # get the actual segment by referencing the index
                seg = doc.get("segs")[seg_idx]
                # segments are composed of words
                # get the array of word indexes and iterate for its values
                for word_idx in seg.get("words"):
                    # get the actual word by referencing the index
                    word = doc.get("words")[word_idx]
                    # push the word text inside the array!
                    word_collection.append(word.get("text"))

            # assign the list of words to the iu label in my new dict
            ius[iu.get("label")] = word_collection
        # return the dict
        return ius

    def calcSims(self, source, summary):
        plainSummaryIUs = self.extractPlaintextIUs(summary)
        plainSourceIUs = self.extractPlaintextIUs(source)

        simsDict = {}
        for summary_idx, summary_iu in plainSummaryIUs.items():
            sims = []
            summary_vect = self.sentLookup(summary_iu)
            # print("sum_vect")
            # print(summary_vect)
            for source_idx, source_iu in plainSourceIUs.items():
                source_vect = self.sentLookup(source_iu)
                sim = similarity(summary_vect, source_vect)
                sims.append([summary_idx, source_idx, sim])
            simsDict[summary_idx] = sorted(
                sims, reverse=True, key=lambda data: data[2])

        # TODO: Add a unique document and sim index for the database
        returnDoc = {
            "doc_type": summary.get("doc_type"),
            "doc_name": summary.get("doc_name"),
            "sims": simsDict
        }
        return returnDoc
