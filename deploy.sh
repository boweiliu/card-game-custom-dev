#!/bin/bash

git rev-parse HEAD > git-HEAD

docker build . --tag card-game-custom-dev

docker run --rm -d -p 3333:3001 card-game-custom-dev
