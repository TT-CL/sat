import sys
import os
import errno

from gensim.models import KeyedVectors

if __name__ == "__main__":
    '''
    This function loads a normalised gensim model in ram and maps it with mmap.
    argv[1] : the gensim model file
    '''

    args = sys.argv         # the CLI args
    # prog = args[0]        # where this file is located
    model_uri = args[1]   # the normalised gensim model location

    # map to memory
    print("Loading gensim model...")
    model = KeyedVectors.load(model_uri, mmap='r')
    # prevent recalc of normed vectors
    # self.__model.syn0norm = self.__model.syn0
    # page the model in
    model.most_similar('word')
    print("Model successfully loaded in memory.")

    # tell bash to continue
    with open('/tmp/wv_server_start_pipe', 'w') as f:
        # print("writing to pipe")
        f.write("START\n")
        f.flush()
        f.close()

    # await the kill signal
    PIPE = '/tmp/wv_model_ram_pipe'
    try:
        os.mkfifo(PIPE)
    except OSError as oe:
        if oe.errno != errno.EEXIST:
            raise

    # print("Awaiting kill signal")

    signal = None
    while signal != "KILL":
        with open(PIPE) as pipe:
            signal = pipe.read().rstrip('\n')

    # print("Kill signal received")
