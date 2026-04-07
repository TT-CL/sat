FROM python:3.10.20-slim AS computation

WORKDIR /code

COPY ./app/requirements.txt /code/app/requirements.txt

RUN pip install --no-cache-dir --upgrade -r /code/app/requirements.txt

COPY ./app /code/app

## DEVELOPMENT
FROM computation AS dev
CMD ["fastapi", "dev", "app/main.py", "--proxy-headers", "--host", "0.0.0.0", "--port", "80"]

## PRODUCTION
FROM computation AS prod
CMD ["fastapi", "run", "app/main.py", "--proxy-headers", "--port", "80"]