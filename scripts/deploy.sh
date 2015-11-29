#!/bin/sh
echo "Start Deploy"
echo "Go to buid directory: $TRAVIS_BUILD_DIR"
cd $TRAVIS_BUILD_DIR
echo "Executing grunt"
grunt deploy
echo "End Deploy"
