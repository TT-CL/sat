FROM tiangolo/uvicorn-gunicorn-fastapi:python3.7

#RUN pip install --user -U numpy
RUN pip install --user -U nltk
RUN pip install -U pip setuptools wheel
RUN pip install -U spacy
RUN pip install -U python-multipart
RUN python -m spacy download en_core_web_sm
RUN python -m nltk.downloader punkt

COPY ./app /app
