#!/bin/sh
# script directory
dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

PROTRACTOR=$dir/../node_modules/protractor
if [ ! -d $PROTRACTOR ]; then
  echo "installing protractor npm module"
  npm install protractor
fi

node $PROTRACTOR/bin/webdriver-manager update --standalone
cd $dir
java -jar $PROTRACTOR/selenium/selenium-server-standalone-2.45.0.jar -role hub -hubConfig hub.json

