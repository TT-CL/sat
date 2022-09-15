# This shell script is a simple alias for docker compose
# It merges the main docker-compose.yml file with the production.yml file
# and passes any arguments as is.
# You can view it as an alias for `docker-compose`
docker compose -f docker-compose.yml -f production.yml "$@"
