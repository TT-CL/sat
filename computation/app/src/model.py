# I/O
import mmap
import sys
import pickle

# vector support functions
from numpy import array as np_array
from numpy import float64 as np_float64
from numpy import mean as np_mean
from numpy import zeros as np_zeros
from scipy.spatial.distance import cosine

# fancy progressbar for terminals
from progressbar import ProgressBar, Bar, Percentage, ETA


def decode_to_list(bytes):
    """ Lambda func that decodes a line to a list """
    return bytes.decode("utf-8").strip().split(" ")


class NotIndexedError(Exception):
    '''
    Raised when trying to access a word that was not indexed in my model
    '''
    def __init__(self, message):
        self.message = message


class BadIndexError(Exception):
    '''
    Raised when the accessed data does not correspond to the requested word
    '''

    def __init__(self, message):
        self.message = message


class RandomAccessVector():
    def __init__(self, start_byte=0, end_byte=0):
        self.start_byte = start_byte
        self.end_byte = end_byte


class RAModel():
    ''' Class for a Random Access Model '''
    def __init__(self, uri, dumpfile=None):
        '''
        this function initializes the embedding model by creating the index
        with the byte addresses of each token
        '''
        self.uri = uri
        self.index = {}
        print("Indexing model...")
        with open(uri, "r+b") as f:
            mm = mmap.mmap(f.fileno(), 0)
            dims = decode_to_list(mm.readline())
            self.cardinality = int(dims[0])
            self.vector_size = int(dims[1])
            print("Indexing model from {}".format(uri))
            print("Tokens: {}".format(self.cardinality))
            print("Vector size: {}".format(self.vector_size))

            bar = ProgressBar(
                maxval=mm.size(),
                widgets=[Bar('#', '[', ']'), ' ', ETA(), ' ', Percentage()],
                len_func=80)
            bar.start()
            prev_pos = mm.tell()
            while prev_pos < mm.size():
                line = decode_to_list(mm.readline())
                bar.update(mm.tell())
                token = line[0]
                self.index[token] = RandomAccessVector(
                    start_byte=prev_pos, end_byte=mm.tell())
                prev_pos = mm.tell()

            bar.finish()  # required to close the progressbar
            f.close()

        # Dump the index to a file
        if dumpfile:
            with open(dumpfile, "wb") as f:
                pickle.dump(self, f, protocol=pickle.HIGHEST_PROTOCOL)

    @classmethod
    def load(self, filename):
        ''' This method loads a previously generated index '''
        with open(filename, "r+b") as f:
            return pickle.load(f)

    def vector(self, word):
        '''
        this function opens the vector file and reads the single line specified
        in my index. It will return a numpy array with the vector for the word
        '''
        res = None
        word = word.strip().lower()
        if word not in self.index.keys():
            raise NotIndexedError("Trying to access a word that is not indexed")
        else:
            with open(self.uri, "r+b") as f:
                mm = mmap.mmap(f.fileno(), 0)
                line = decode_to_list(
                    mm[self.index[word].start_byte:self.index[word].end_byte])
                if word != line[0]:
                    raise BadIndexError(
                        "Your index is corrupted.\n" +
                        "Please reload your vector model.")
                else:
                    res = np_array(line[1:], dtype=np_float64)
                f.close()
        return res

    def sent_vector(self, sent):
        '''
        This method averages the vectors for the words of a sentence
        If a word is not indexed it will be skipped
        If the index is corrupted, the function will raise an exception
        '''
        def v(word):
            try:
                # try to get a vector
                return self.vector(word)
            except NotIndexedError:
                # if the vector is not in the model then I can skip it
                print("zeroing")
                return np_zeros(self.vector_size, dtype=np_float64)
            except BadIndexError as e:
                # if the model is badly formatted raise an exception
                raise e
        # obtaining vectors with list comprehension
        vectors = [v(word) for word in sent]
        # return an average of the vectors
        return np_mean(vectors, axis=0)

    def similarity(self, word_a, word_b):
        '''
        this function retrieves two vectros and returns their similarity
        '''
        return 1 - cosine(self.vector(word_a), self.vector(word_b))

    def sent_similarity(self, sent_a, sent_b):
        '''
        this function averages the vectorsr in two sentences and
        returns their similarity
        '''
        return 1 - cosine(self.sent_vector(sent_a), self.sent_vector(sent_b))


if __name__ == "__main__":
    '''
    calling this library from cli will allow you to create a new index for a
    generic vector model and dump it as a python object with pickle.
    args[1] is your model file
    args[2] is where you want to store the python index
    '''
    args = sys.argv
    uri = args[1]
    dumpfile = args[2]

    print("Reading model from {}".format(uri))
    model = RAModel(uri, dumpfile)
    print("The model was successfully indexed.")
