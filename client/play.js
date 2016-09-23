var Game = require('./game');

module.exports = function(element, options) {
  var game = Game(options);
  element.appendChild(game.element);
  game.initialize();
};
