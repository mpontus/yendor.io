var fs = require('fs');
var path = require('path');
var express = require('express');
var browserify = require('browserify-middleware');

var session = require('./session');
var games = require('./games');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(session);
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res, next) {
  res.render('index');
});

app.get('/play/:game', function(req, res, next) {
  var game = req.params.game;
  if (!games[game]) {
    var err = new Error("Not Found");
    err.status = 404;
    return next(err);
  }
  var options = games[game];
  var readmePath = path.join(__dirname, 'docs', game, 'readme.txt');
  fs.readFile(readmePath, function(err, readmeContents) {
    res.render('play', {
      game: game,
      title: options.title,
      term: options.term,
      readme: readmeContents,
    });
  });
});

app.get('/js/client.js', browserify('./client/index.js', {
  debug: true,
  transform: [ "brfs" ]
}));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
