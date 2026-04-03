# Computation
Python api backend, based on FastAPI, spacy and gensim.

## Provided functionality
- Idea Unit segmentation
- Idea Unit alignment
- Word embedding server
- Sentence similarity server
- TODO: JWT token authentication

## Environment Variables
Custom environment variables can be set via `fastapi.env`.
Note: the working directory is `/computation/app/`.

- `CUSTOM_VECTORS` is the location of a custom w2v file. If left empty the program will try to load `/computation/app/models/vectors.txt`. If this file does not exist, [Stanford's GloVe Wikipedia 2014 + Gigaword 5](https://nlp.stanford.edu/projects/glove/) 300d model is downloaded.
- `NO_HEADER` set this to false if the first line of your vector file specifies the cardinality and the size of the vectors. If set to true, gensim will try to infer the correct dimensions from the first row.
- `GENSIM_MODEL` where you want to store your optimized gensim model. By default it will be stored inside `models/gensim/model.bin`.
- `GOOGLE_OAUTH_CLIENT_ID` and `GOOGLE_OAUTH_CLIENT_SECRET` are for dedicated to OAuth authentication (see [below](#google-oauth-authentication)).

## Google OAuth Authentication
- Go to this [link]() and make a create a new OAuth client. If necessary create a new GCP project for SAT
- In `Authorized Javascript origins` add `http://localhost:5000`. When you deploy the project also add `https://www.yourwebsite.com`. Traefik will handle SSL certificates, so ensure you are using HTTPS.
- In `Authorized redirect URIs` add the following 3 URIs:
  - `http://localhost:5000/catch-login`
  - `http://localhost:5000/silent-refresh.html`
  - `http://localhost:5000/api/auth/google`<br>**When deploying**
  - Add three new URIs replacing localhost with your domain and HTTP with HTTPS
- Populate `fastapi.env` with your `GOOGLE_OAUTH_CLIENT_ID` and `GOOGLE_OAUTH_CLIENT_SECRET`. You can find these on the right half of the page.