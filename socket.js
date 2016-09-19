var Docker = require('dockerode-promise');
var Server = require('socket.io');

var io = new Server;
var docker = new Docker();

io.sockets.on('connection', function(socket) {
  docker.createContainer({
    image: 'yendor/nethack',
    AttachStdin: true,
    AttachStdout: true,
    Tty: true,
    OpenStdin: true,
  }).then(function (container) {
    socket.on('disconnect', function () {
      container.remove();
    });
    if (!socket.connected) {
      return container.remove();
    }
    container.attach({
      stream: true,
      stdin: true,
      stdout: true
    }).then(function (stream) {
      stream.on('end', function () {
        socket.disconnect();
      });
      socket.on('data', function (data) {
        console.log('<data');
        stream.write(data);
      });
      stream.on('data', function (data) {
        console.log('>data');
        socket.emit('data', data.toString());
      });
      });
    container.start();
  });
});

