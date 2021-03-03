from autocorrect import Speller
from json_tricks import dumps
import spacy
# from src.model import RAModel
from src.model import Model

nlp = spacy.load("en_core_web_sm")

spell = Speller()


class ModelWebWrapper(Model):
    '''
    This class wraps the Model class and provides some useful web functionality
    such as autocorrect and JSON rendering
    '''

    def lookup(self, word, autocorrect=False, http=False):
        vect = None
        httpRes = None
        if word.strip().lower() in self._model:
            vect = self._vector(word)
            httpRes = {
                "word": word,
                "vect": vect
            }
        elif autocorrect is True and spell(word.strip().lower()) in self._model:
            vect = self._vector(spell(word.lower()))
            httpRes = {
                "word": word,
                "autocorrect": spell(word.lower()),
                "vect": vect
            }
        else:
            self._add_miss(word)
            httpRes = {
                "word": word,
                "vect": None
            }

        res = vect
        if http is True:
            res = dumps(httpRes)
        return res

    def sentLookup(self, sent, autocorrect=False, http=False):
        tokens = None
        if isinstance(sent, list):
            tokens = sent
        else:
            tokens = [token.text for token in nlp(sent)]
        if autocorrect is True:
            tokens = [spell(token) for token in tokens]

        res = self._sent_vector(tokens)
        if http is True:
            # json preparation for HTTP protocol
            temp = {'sent': sent,
                    'vector': res}
            res = dumps(temp)
        return res

    def simsLookup(self, s1, s2, autocorrect=False, http=False):
        sent1 = None
        sent2 = None
        if isinstance(s1, list):
            sent1 = s1
        else:
            sent1 = [token.text for token in nlp(s1)]
        if isinstance(s2, list):
            sent2 = s2
        else:
            sent2 = [token.text for token in nlp(s2)]
        if autocorrect is True:
            sent1 = [spell(token) for token in sent1]
            sent2 = [spell(token) for token in sent2]

        res = self._sent_similarity(sent1, sent2)
        if http is True:
            # json preparation for HTTP protocol
            temp = {'sent1': s1,
                    'sent2': s2,
                    'similarity': res.item()}
            res = dumps(temp)
        return res

    def docSims(self, source, summary):
        plainSummaryIUs = extractPlaintextIUs(summary)
        plainSourceIUs = extractPlaintextIUs(source)

        simsDict = {}
        for summary_idx, summary_iu in plainSummaryIUs.items():
            sims = []

            for source_idx, source_iu in plainSourceIUs.items():
                sim = self._sent_similarity(summary_iu, source_iu).item()
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


def extractPlaintextIUs(doc):
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
