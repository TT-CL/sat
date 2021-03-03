# vector support functions
from numpy import array as np_array
from numpy import float32 as np_float32
from numpy import zeros as np_zeros

from gensim.models import KeyedVectors
from gensim.matutils import unitvec as gs_unitvec


def mean_vector(vectors):
    # this function computes a mean vector given a list of vectors
    # copied straight from gensim
    return gs_unitvec(np_array(vectors).mean(axis=0)).astype(np_float32)


class Model():
    ''' Class for a Gensim Model client '''

    def __init__(self, model_uri):
        '''
        Initializes a client for the gensim model loaded in ram.
        '''
        self.__model_uri = model_uri
        self._model = KeyedVectors.load(model_uri, mmap='r')
        # prevent recalc of normed vectors
        # self._model.syn0norm = self._model.syn0
        # init the list of misses
        self.__misses = []

    def _get_misses(self):
        # TODO: retrieve misses with api call
        return self.__misses

    def _add_miss(self, word):
        # print("Miss: {}".format(word))
        self.__misses.append(word)

    def _clear_misses(self):
        self.__misses = []

    def _vector(self, word):
        '''
        Retrieves a vector from the model
        '''
        return self._model[word.lower()]

    def _vector_or_zero(self, word):
        '''
        Retrieves a vector from the model.
        If the vector cannot be found it returns a zeroed array.
        '''
        try:
            # try to get a vector
            return self._vector(word)
        except KeyError:
            # if the vector is not in the model then I can skip it
            self._add_miss(word)
            return np_zeros(self._model.vector_size, dtype=np_float32)

    def _sent_vector(self, sent):
        '''
        Averages the vectors for the words of a sentence
        If a word is not indexed it will be skipped
        I expect a tokenized sentence in input
        '''
        # obtaining vectors with list comprehension
        vectors = [self._vector_or_zero(word) for word in sent]
        # return an average of the vectors
        return mean_vector(vectors)

    def _similarity(self, word_a, word_b):
        '''
        this function retrieves two vectors and returns their similarity
        '''
        vect_a = self._vector_or_zero(word_a)
        vect_b = self._vector_or_zero(word_b)
        return self._model.similarity(vect_a, vect_b)

    def _sent_similarity(self, sent_a, sent_b):
        '''
        this function averages the vectors in two sentences and
        returns their similarity
        '''
        return self._model.cosine_similarities(
            self._sent_vector(sent_a), [self._sent_vector(sent_b)])[0]
