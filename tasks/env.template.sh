#!/bin/sh
#
# The shell evironment variables are used by the unit test.
# Add valid test user credentials and rename to env.sh.
#
# Usage:
#   cp tasks/env.template.sh tasks/env.sh
#   # set env vars in tasks/env.sh and run:
#   source tasks/env.sh && mocha
#   # or use npm
#   # npm run-script test-api
#
export SCT_API_KEY=""
export SCT_API_URL=""
export SCT_OAUTH_CLIENT_ID=""
export SCT_OAUTH_CLIENT_SECRET=''
export SCT_USER=''
export SCT_PASSWORD=''
