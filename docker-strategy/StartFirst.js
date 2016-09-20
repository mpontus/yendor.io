var util = require('util');
var BaseDockerStrategy = require('./Base');

/**
 * Strategy for docker initialization which starts the container before attching
 * the stream. Used for games which redraw the screen on SIGWINCH.
 */
function StartFirstDockerStrategy (options) {
  var self = this;

  BaseDockerStrategy.call(this, options);

  this.on('containerObtained', function (container) {
    container.start().then(function() {
      return container.resize({ w: 100, h: 34 });
    }).then(function() {
      return container.attach({
        stream: true,
        stdin: true,
        stdout: true,
      });
    }).then(function(stream) {
      self.setStream(stream);
    });
  });
}

util.inherits(StartFirstDockerStrategy, BaseDockerStrategy);

module.exports = StartFirstDockerStrategy;
