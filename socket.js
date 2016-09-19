var Docker = require('dockerode-promise');
var Server = require('socket.io');
var games = require('./games');

var io = new Server;
var docker = new Docker();

io.sockets.on('connection', function(socket) {

  // Try and retrieve game options from a list of known games
  var game = socket.handshake.query.game;
  if (!game || !games[game]) {
    // Disconnect if game queried by client is not known
    return socket.disconnect();
  }
  var options = games[game];

  // TTY dimensions
  var size = {
    w: 80,
    h: 24,
  };

  // Buffer client's terminal size while creating the container
  socket.on('resize', function (_size) {
    size = _size;
  });

  // Create new Docker container
  docker.createContainer({
    image: options.dockerImage,
    AttachStdin: true,
    AttachStdout: true,
    Tty: true,
    OpenStdin: true,
  }).then(function (container) {

    // Remove the container if client disconnected during creation
    if (!socket.connected) {
      console.log('removed');
      return container.remove();
    }

    // Remove the container as soon as client disconnects
    socket.on('disconnect', function() {
      console.log('removed');
      container.remove({
        force: true,
      });
    });

    // Launch the container
    container.start().then(function () {
      console.log("started");

      // Attach socket.io stream to container TTY
      container.attach({
        stream: true,
        stdin: true,
        stdout: true
      }).then(function(stream) {
        console.log("attached");

        // Synchronize client's terminal size with container TTY
        container.resize(size);
        socket.on('resize', function(size) {
          container.resize(size);
        });

        // Handle IO
        socket.on('data', function(data) {
          stream.write(data);
        });
        stream.on('data', function(data) {
          socket.emit('data', data.toString());
        });

        // Disconnect the client as soon as container exits
        stream.on('end', function() {
          socket.disconnect();
        });
      });
    });
  });
});

module.exports = io;
