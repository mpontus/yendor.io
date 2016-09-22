var Docker = require('dockerode');
var Server = require('socket.io');
var sharedSession = require('express-socket.io-session');
var path = require('path');
var session = require('./session');
var games = require('./games');
var DockerSession = require('./DockerSession');

var io = new Server();
var docker = new Docker();

io.use(sharedSession(session));

io.sockets.on('connection', function(socket) {
  try {
    // Try and retrieve game options from a list of known games
    var game = socket.handshake.query.game;
    if (!game || !games[game]) {
      // Disconnect if game queried by client is not known
      throw new Error("Unknown game identifier: " + game);
    }
    var options = games[game];

    var playerid = socket.handshake.session.playerid;

    var dockerSession = new DockerSession(docker, {
      dockerImage: options.dockerImage,
      attachAfterStart: options.attachAfterStart,
      bindings: [{
        from: path.join(__dirname, 'data', 'games', game, playerid),
        to: options.gameDataDir,
      }],
    });

    dockerSession.initialize();

    dockerSession.on('status', function(status) {
      console.log(status);
    });

    dockerSession.on('initialized', function() {
      var stream = dockerSession.stream;
      socket.on('data', function(data) {
        stream.write(data);
      });
      stream.on('data', function(data) {
        socket.emit('data', data.toString());
      });
      stream.on('end', function() {
        socket.disconnect();
      });
    });

    // Resize container's tty
    socket.on('resize', function(size) {
      dockerSession.resize({
        w: parseInt(size.w),
        h: parseInt(size.h)
      });
    });

    // Shut down docker container when client disconnects
    socket.on('disconnect', function() {
      dockerSession.abort();
    });

  } catch (err) {
    socket.disconnect();
    console.warn("Socket connection error: " + err);
    throw err;
  }
});

module.exports = io;
