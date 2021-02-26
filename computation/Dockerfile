FROM tiangolo/uvicorn-gunicorn-fastapi:python3.8

#RUN pip install --user -U numpy
#RUN pip install --user -U nltk
#RUN pip install -U pip setuptools wheel
#RUN pip install -U spacy
#RUN pip install -U python-multipart
#RUN pip install --upgrade gensim
#RUN pip install autocorrect
#RUN pip install json-tricks

COPY ./app /app

RUN pip install -r /app/requirements.txt
RUN python -m spacy download en_core_web_sm
RUN python -m nltk.downloader punkt