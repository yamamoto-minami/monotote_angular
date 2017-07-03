#!/bin/sh

# script directory
dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "--------------------------------------------------------"
echo ""
echo "karma server should be running, start with 'karma start'"
echo ""
echo "--------------------------------------------------------"
cd $dir/..
nodemon --exec karma run
