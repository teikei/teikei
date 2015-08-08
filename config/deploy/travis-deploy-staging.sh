#!/bin/bash

if [[ "$TRAVIS_PULL_REQUEST" == "false" ]] ; then
  echo "Deploying build to staging server..."
  cap staging deploy
fi
