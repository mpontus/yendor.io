var util = require('util');
var EventEmitter = require('events').EventEmitter;
var Docker = require('dockerode-promise');

function BaseDockerStrategy (options) {
  var self = this;

  EventEmitter.call(this);
  this._options = options;
  this._stopped = false;
  this._docker = new Docker();

  this._docker.createContainer({
    Image: this._options.dockerImage,
    AttachStdin: true,
    AttachStdout: true,
    Tty: true,
    OpenStdin: true,
  }).then(function(container) {
    if (self._stopped) {
      return container.remove();
    }
    self.on('stop', function () {
      container.remove({
        force: true,
      });
    });
    self._container = container;
    self.emit('containerObtained', container);
  });
};

util.inherits(BaseDockerStrategy, EventEmitter);

BaseDockerStrategy.prototype.getStream = function () {
  var self = this;

  if (this._stream) {
    return Promise.resolve(this._stream);
  }

  return new Promise((resolve, reject) => {
    self.once('streamObtained', function(stream) {
      resolve(stream);
    });
  });
};

BaseDockerStrategy.prototype.setStream = function (stream) {
  this._stream = stream;
  this.emit('streamObtained', stream);
};

BaseDockerStrategy.prototype.stop = function () {
  this._stopped = true;
  this.emit('stop');
};

module.exports = BaseDockerStrategy;
