var jsonServer  = require('json-server');
var source      = './data.json';
var chalk       = require('chalk');
var path        = require('path');
var fs          = require('fs');
var port        = 8022;
var _           = require('lodash');

// Returns an Express server
var server = jsonServer.create()

// Returns an Express router
var router = jsonServer.router(source)
var db = router.db

// Default middlewares (logger, static and cors)
server.use(jsonServer.defaults)

// custom routes
server.use('/auth/publisher', function (req, res) {
  res.jsonp(db.object.auth.publisher);
});


server.post('/shoppables', function (req, res) {
  res.jsonp(db.object.shoppablesPOST);
})

server.get('/products/:universe', function (req, res) {
  res.jsonp(db.object.productUniverseSearch);
})

server.get('/products/:universe/filters', function (req, res) {
  res.jsonp(db.object.filters);
})

server.get('/products/:universe/:sku', function (req, res) {
  res.jsonp(db.object.productDetail);
})

server.post('/oauth/access_token', function (req, res) {
  res.jsonp(db.object.oauth);
})


// Mount router on '/'
server.use(router)

console.log('Watching', chalk.cyan(source))

var watchedDir = path.dirname(source)
var watchedFile = path.basename(source)
fs.watch(watchedDir, function (event, changedFile) {
  // lowdb generates 'rename' event on watchedFile
  // using it to know if file has been modified by the user
  if (event === 'change' && changedFile === watchedFile) {
    console.log(chalk.cyan(source), 'has changed, reloading database')

    try {
      var watchedFileObject = JSON.parse(fs.readFileSync(source))
      db.object = watchedFileObject
    } catch (e) {
      console.log('Can\'t parse', chalk.cyan(source))
      console.log(e.message)
    }
    console.log()
  }
});

// Start server
server.listen(port);

// Expose server
exports = module.exports = server;
