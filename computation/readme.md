# Computation
Python api backend, based on FastAPI, spacy and gensim.

## Provided functionality
- Idea Unit segmentation
- Idea Unit alignment
- Word embedding server
- Sentence similarity server
- TODO: JWT token authentication

## Environment Variables
Custom environment variables can be set via `variables.env`.
Note: the working directory is `/computation/app/`.

- `CUSTOM_VECTORS` is the location of a custom w2v file. If left empty the program will try to load `/computation/app/models/vectors.txt`. If this file does not exist, [Stanford's GloVe Wikipedia 2014 + Gigaword 5](https://nlp.stanford.edu/projects/glove/) 300d model is downloaded.
- `NO_HEADER` set this to false if the first line of your vector file specifies the cardinality and the size of the vectors. If set to true, gensim will try to infer the correct dimensions from the first row.
- `GENSIM_MODEL` where you want to store your optimized gensim model. By default it will be stored inside `models/gensim/model.bin`.