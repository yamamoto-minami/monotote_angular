#!/bin/sh

# script directory
dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source $dir/env.sh

cd $dir/../test
nodemon --exec mocha *.spec.js
#mocha *.spec.js
