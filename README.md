# app

# angularJS

## development setup

Clone repository

Install npm and bower modules

```sh
npm install && bower install
```

### Run development server

```sh
grunt serve:dev
```

### Run development rest API

Optionally replace https://dev-api.shoppingcarttechnologies.com/api/v1
with a local json server based on
[json-server](https://github.com/typicode/json-server). View
```server-dev/data.json``` for the implemented api calls.

#### Start the rest server with

```sh
npm run-script rest-server
```

#### Set client app configuration

Edit client/config/config.js to set api keys and other configs.

```
mixpanelToken: 'cc71746142b7e85479c02f7d1213a136',
```

## app configuration

SCT configuration (api key, paths, ...) are in client/config/config.js
and can be extended/overriden using the window.__sct__config variable.

```html
<script type='text/javascript'>
(function() {
 window.__sct__config = window.__sct__config || {};
 __sct__config['mixpanel_token']='2a06ea1877d261975fa0763c93b8725a';
 })();
</script>
```

## REST endpoint unit-tests

The test directory contains the REST endpoint tests. To run the tests
set the correct environment and run mocha.

### Environment

The test expects the following environment settings to be set to a valid
user for the publisher login.


```sh
export SCT_ID=''
export SCT_API_PASSWORD=''
export SCT_API_KEY=''
```

### Run test

In the root of the project directory run.

```sh
mocha
```

or

```sh
npm run-script test-api
```
## Login

On application startup

```
check if access_token exists in cookie.
{
    - with access_token call GET /v1/publisher, on 401 will send the user to the login.
    - if current route is login subsection send user to default route
} else {
    - route to login
    - call /oauth/access_token with username and password
    - on 200 store access_token in cookie and response body in
      $rootScope.token and call GET /v1/publisher
    - move to default route
}
```


## Deployment

All deployments must go through CodeShip the automatic deployments are:

 1. develop branch deploys to Dev 
 
 2. master branch deploys to staging 
 
 3. any tags get deployed to production (tag-v1.3)