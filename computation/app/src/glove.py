from gensim.models.keyedvectors import KeyedVectors
from autocorrect import Speller
from json_tricks import dumps

model_location = "./models/glove.6B.50d.txt"
spell = Speller()

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
