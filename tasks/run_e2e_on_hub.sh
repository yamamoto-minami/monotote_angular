#!/bin/sh
export SELENIUM_URL="http://192.168.0.205:4444/wd/hub"
export HTTP_HOST="192.168.0.205"
export HTTP_PORT="9000"

# script directory
dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
#
cd $dir/..
nodemon --watch e2e --exec protractor
