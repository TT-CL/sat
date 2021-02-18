# SummaryEval
Complete server architechture for a framework for the evaluation of L2 summaries.

Current server structure:
 - front-end: Angular front-end
 - computation: Python3 FastAPI server (served on port 8080)

## Deployement
The server runs entirely on Docker architecture.
Run 'docker-build' when first cloning the repo followed by 'docker-compose' up to bring the servers up.
Make sure to set the environment variables first.

## Environment variables
The build process is able to distinguish between production and development settings through these environment variables:
 - 'DOCKER_ENV= prod | dev'
 - 'DOCKER_PORT= any' sets the server port for the front-end server
