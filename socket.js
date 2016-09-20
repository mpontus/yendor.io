var Docker = require('dockerode-promise');
var Server = require('socket.io');
var sharedSession = require('express-socket.io-session');
var path = require('path');
var session = require('./session');
var games = require('./games');
var strategies = require('./docker-strategy');

var io = new Server;

io.use(sharedSession(session));

io.sockets.on('connection', function(socket) {
  var game, options, strategyName, strategyClass, strategy;

  try {
    // Try and retrieve game options from a list of known games
    var game = socket.handshake.query.game;
    if (!game || !games[game]) {
      // Disconnect if game queried by client is not known
      throw new Error("Unknown game identifier: " + game);
    }
    var options = games[game];

    // Find the strategy for initializing docker container
    var strategyName = options.dockerStrategy
      ? options.dockerStrategy
      : 'AttachFirst';

    var strategyClass = strategies[strategyName];

    if (!strategyClass) {
      throw new Error("Unknown docker strategy: " + strategyName);
    }

    var playerid = socket.handshake.session.playerid;

    var strategy = new strategyClass({
      dockerImage: options.dockerImage,
      gameDataDir: {
        from: path.join(__dirname, 'gamedata', game, playerid),
        to: options.gameDataDir,
      }
    });

    // Attach IO
    strategy.getStream().then(function(stream) {
      socket.on('data', function(data) {
        stream.write(data);
      });
      stream.on('data', function(data) {
        socket.emit('data', data.toString());
      });
      stream.on('end', function () {
        socket.disconnect();
      });
    });

    // Shut down docker container when client disconnects
    socket.on('disconnect', function () {
      strategy.stop();
    });

  } catch (err) {
    socket.disconnect();
    console.warn("Socket connection error: " + err);
    throw err;
  }
});

module.exports = io;
