var util = require('util');
var BaseDockerStrategy = require('./Base');

/**
 * Strategy for docker initialization which attaches a stream to container
 * before starting up. Used for games which do not react to SIGWINCH.
 */
function AttachFirstDockerStrategy (options) {
  var self = this;

  BaseDockerStrategy.call(this, options);

  this.on('containerObtained', function(container) {
    container.attach({
      stream: true,
      stdin: true,
      stdout: true,
    }).then(function(stream) {
      self.setStream(stream);
    }).then(function() {
      return container.start();
    }).then(function() {
      return container.resize({ w: 100, h: 34 });
    });
  });
}

util.inherits(AttachFirstDockerStrategy, BaseDockerStrategy);

module.exports = AttachFirstDockerStrategy;
