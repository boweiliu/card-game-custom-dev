#!/bin/bash


# run locally

git rev-parse HEAD > git-HEAD
docker build . --tag card-game-custom-dev
docker run --rm -d -p 3333:3001 card-game-custom-dev


# run on fly.io : just push to main
# https://card-game-custom-dev.fly.dev/
