#!/bin/sh

# script directory
dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source $dir/env.sh
cd $dir/..
nodemon --watch e2e --exec protractor
