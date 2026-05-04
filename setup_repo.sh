#!/usr/bin/env bash

#If any command fails, throw an error
set -euo pipefail

#Get absolute dir name and start working from there
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

# List of directories to create if they don't exist
DIRS=(
  "db/storage" #database
  "certificates" #SSL certificates
)

for dir in "${DIRS[@]}"; do
  #Create directories
  mkdir -p "$dir"
  printf 'Touched directory %s\n' "$dir"
done

# List of .env.example files to copy to real .env files
ENV_EXAMPLES=(
  "db/root_user.env.example"
  "db/api_user.env.example" 
  "computation/fastapi.env.example"
  "front-end/src/environments/environment.ts.example"
  "front-end/src/environments/environment.prod.ts.example"
  ".env.example"
)

for env_file in "${ENV_EXAMPLES[@]}"; do
  if [ ! -f "$env_file" ]; then
    # Check if the source .env.example file actually exists.
    printf 'Source missing, skipping: %s\n' "$env_file"
    continue
  fi

  #Strip .example from filename
  target="${env_file%.example}"

  if [ -e "$target" ]; then
    # Do not override esisting .envs
    printf 'Skipped existing file: %s\n' "$target"
  else
    # Copy the example file when .env is missing
    cp "$env_file" "$target"

    printf 'Copied: %s -> %s\n' "$env_file" "$target"
  fi
done
# End of the explicit env file copy loop.

printf '\nRepo successfully instantiated.\nBe sure to populate the .env files before running docker compose\n'