var http = require('http');
var app = require('./app');
var socket = require('./socket');

var server = http.createServer(app);
socket.attach(server);

server.listen(process.env.PORT || 3000, function() {
  var addr = server.address();
  var bind = typeof addr === 'string'
           ? 'pipe ' + addr
           : 'port ' + addr.port;
  console.log('Now listening on ' + bind);
});
