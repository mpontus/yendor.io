var EventEmitter = require('events').EventEmitter;
var async = require('async');
var mkdirp = require('mkdirp');

/**
 * DockerSession constructor
 *
 * Valid options:
 *
 *     dockerImage      - Image name for the container (required)
 *     attachAfterStart - If true stream will only be attached to container's tty after startup
 *     bindings         - List of docker volume bindings in form {from: <host path>, to: <container path>}
 *
 * @inherits NodeJS EventEmitter
 * @param {Object} docker Instance of Dockerode's Docker
 * @param {Object} options Options for docker session
 * @event `status`      [creating|starting|attaching|resizing|resized|removing|removed]
 * @event `initialized` Container finished initializing, stream is available.
 */
var DockerSession = function(docker, options) {
  this.docker = docker;
  this.options = options;
  this.aborted = false;
  this.initialized = false;
  this.size = null;
  this.container = null;
};

/**
 * Inherit from EventEmitter
 */
DockerSession.prototype.__proto__ = EventEmitter.prototype;

/**
 * Begin initialization of docker container
 */
DockerSession.prototype.initialize = function() {
  if (!this.options.dockerImage) {
    throw new Error("Docker image must be provided as an option.");
  }
  this.options.bindings = this.options.bindings || [];
  var _this = this;
  async.eachSeries(this.options.bindings, function (item, next) {
    mkdirp(item.from, next);
  }, function (err) {
    if (err) throw err;
    _this.create();
  });
};

/**
 * Create new docker container according to provided options
 */
DockerSession.prototype.create = function() {
  var _this = this;
  this.emit('status', 'creating');
  this.docker.createContainer({
    Image: this.options.dockerImage,
    AttachStdin: true,
    AttachStdout: true,
    Tty: true,
    OpenStdin: true,
    HostConfig: {
      Binds: this.options.bindings.map(function (bind) {
        return bind.from + ':' + bind.to;
      }),
    },
  }, function(err, container) {
    _this.handleCreated(err, container);
  });
  this.on('initialized', function() {
    _this.resizeMaybe();
  });
};

/**
 * Attach docker container tty to a stream
 */
DockerSession.prototype.attach = function() {
  var _this = this;
  this.emit('status', 'attaching');
  this.container.attach({
    stream: true,
    stdin: true,
    stdout: true,
  }, function(err, stream) {
    _this.handleAttached(err, stream);
  });
};

/**
 * Start the docker container
 */
DockerSession.prototype.start = function() {
  var _this = this;
  this.emit('status', 'starting');
  this.container.start(function(err) {
    _this.handleStarted(err);
  });
};

/**
 * Change the required dimensions of docker container's tty
 *
 * @param {Object} size Required dimensions in form {w: <int>, h: <int>}
 */
DockerSession.prototype.resize = function(size) {
  this.size = size;
  if (this.initialized) {
    this._resize();
  }
};

/**
 * Resize container's tty if required dimensions differ from defaults
 */
DockerSession.prototype.resizeMaybe = function() {
  if (this.size !== null) {
    this._resize();
  }
};

/**
 * Perform actual resizing
 */
DockerSession.prototype._resize = function() {
  this.emit('status', 'resizing');
  var _this = this;
  this.container.resize(this.size, function() {
    _this.emit('status', 'resized');
  });
};

/**
 * Remove existing docker container or prevent further initialization
 */
DockerSession.prototype.abort = function() {
  this.aborted = true;
  if (this.initialized) {
    this._remove();
  }
};

/**
 * Actually remove the container
 */
DockerSession.prototype._remove = function() {
  this.emit('status', 'removing');
  var _this = this;
  this.container.remove({
    force: true,
  }, function() {
    _this.emit('status', 'removed');
  });
};

/**
 * Perform actions following creation of a container
 */
DockerSession.prototype.handleCreated = function(err, container) {
  this.container = container;
  if (this.aborted) {
    return this._remove();
  }
  if (this.options.attachAfterStart) {
    this.start();
  } else {
    this.attach();
  }
};

/**
 * Perform actions following attachment to a container
 */
DockerSession.prototype.handleAttached = function(err, stream) {
  if (err) throw err;
  this.stream = stream;
  if (this.aborted) {
    return this._remove();
  }
  if (this.options.attachAfterStart) {
    this.handleInitialized(null);
  } else {
    this.start();
  }
};

/**
 * Perform actions after container startup
 */
DockerSession.prototype.handleStarted = function(err) {
  if (err) throw err;
  if (this.aborted) {
    return this._remove();
  }
  if (this.options.attachAfterStart) {
    this.attach();
  } else {
    this.handleInitialized(null);
  }
};

/**
 * Perform actions following full container initiialization
 */
DockerSession.prototype.handleInitialized = function(err) {
  if (err) throw err;
  this.initialized = true;
  this.emit('initialized');
  if (this.aborted) {
    return this._remove();
  }
};

module.exports = DockerSession;
