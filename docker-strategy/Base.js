var util = require('util');
var EventEmitter = require('events').EventEmitter;
var mkdirp = require('mkdirp');
var Docker = require('dockerode-promise');

function BaseDockerStrategy (options) {
  var self = this;

  EventEmitter.call(this);
  this._options = options;
  this._stopped = false;
  this._docker = new Docker();

  this.ensureDirExists(options.gameDataDir.from)
    .then(function() {
      var bind = options.gameDataDir.from + ':' + options.gameDataDir.to;
      return self._docker.createContainer({
        Image: self._options.dockerImage,
        AttachStdin: true,
        AttachStdout: true,
        Tty: true,
        OpenStdin: true,
        HostConfig: {
          Binds: [bind],
        },
      })
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
    }).catch(function(err) {
      console.warn("Error while initializing the container: " + err);
    });
  
};

util.inherits(BaseDockerStrategy, EventEmitter);

BaseDockerStrategy.prototype.ensureDirExists = function(directoryPath) {
  return new Promise(function(resolve, reject) {
    mkdirp(directoryPath, function (err) {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
}

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
