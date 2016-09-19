var http = require('http');
var socketio = require('socket.io');
var Docker = require('dockerode-promise');
var app = require('./app');

var server = http.createServer(app);
var io = new socketio();
io.attach(server);
// var io = socketio(server);
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

/*     .then(function (container) {
    console.log(container);
    return container.start();
  }).then(function (container) {
    return container.attach();
  }).then(function (stream) {
    stream.on('data', function (data) {
      console.log(data);
      socket.emit('data', data);
    });
  });
 */


server.listen(process.env.PORT || 3000, function() {
  var addr = server.address();
  var bind = typeof addr === 'string'
           ? 'pipe ' + addr
           : 'port ' + addr.port;
  console.log('Now listening on ' + bind);
});
