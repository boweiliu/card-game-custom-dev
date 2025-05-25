#!/bin/bash


# run locally

git rev-parse HEAD > git-HEAD
docker build . --tag card-game-custom-dev
docker run --restart=always --name card-dev -d -p 3333:3001 card-game-custom-dev

docker logs card-dev
# timeout 10 docker run --rm -it -p 3333:3001 card-game-custom-dev


# run on fly.io : just push to main
# https://card-game-custom-dev.fly.dev/
