import sys
from gensim.models import KeyedVectors
import os

if __name__ == "__main__":
    '''
    This function reads some new WV model, normalizes the vectors to increase
    similarity performance and stores the normalized model in a new file.
    CLI Params:
    argv[1] : the vector file
    argv[2] : where I want to store my normalized model
    argv[3] : if the 3rd flag is set to true, then my model has no headers
    '''

    args = sys.argv         # the CLI args
    # prog = args[0]        # where this file is located
    vectors_uri = args[1]   # the wv model location
    store_uri = args[2]     # where I want to store the normalised gensim model
    no_header = False
    if len(args) > 3:
        no_header = args[3].lower() == 'true'

    # Load the vectors in a KeyedVector model
    print("Loading word vector model in memory...")
    model = KeyedVectors.load_word2vec_format(
        vectors_uri, binary=False, no_header=no_header)
    print("Word vector model loaded successfully")

    # Force unit-normalization for the vectors
    print("Normalizing vectors...")
    model.fill_norms()
    print("Vectors normalized")

    # Store the normalized vectors
    print("Storing the model")

    if not os.path.exists(os.path.dirname(store_uri)):
        # create the directories if the do not exist
        os.makedirs(os.path.dirname(store_uri))

    model.save(store_uri)
    print("Model stored in " + store_uri)