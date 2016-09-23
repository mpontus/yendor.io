var async = require('async');
var Docker = require('dockerode');

/**
 * @param {Function} cb Callback to run after removing all docker containers
 */
module.exports = function(cb) {
  var docker = new Docker();
  docker.listContainers({all: true}, function(err, containers) {
    if (err) throw err;
    async.eachSeries(containers, function(container, next) {
      container = docker.getContainer(container.Id);
      container.remove({force: true}, function(err) {
        if (err) throw err;
        next();
      });
    }, cb);
  });
}
