FROM tiangolo/uvicorn-gunicorn-fastapi:python3.8

COPY ./app /app

RUN pip install -r /app/requirements.txt
RUN python -m spacy download en_core_web_sm
RUN python -m nltk.downloader punkt