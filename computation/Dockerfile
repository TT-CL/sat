FROM python:3.10.20-slim AS computation

RUN apt-get update && apt-get install -y --no-install-recommends curl unzip && rm -rf /var/lib/apt/lists/*


COPY ./app/requirements.txt /code/app/requirements.txt

RUN pip install --no-cache-dir --upgrade -r /code/app/requirements.txt

COPY ./app /code/app

RUN chmod +x /code/app/prestart.sh


WORKDIR /code/app

## DEVELOPMENT
FROM computation AS dev
CMD ["/bin/sh", "-c", "./prestart.sh && exec fastapi dev main.py --proxy-headers --host 0.0.0.0 --port 80"]

## PRODUCTION
FROM computation AS prod
CMD ["/bin/sh", "-c", "./prestart.sh && exec fastapi run main.py --proxy-headers --host 0.0.0.0 --port 80"]