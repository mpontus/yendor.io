var Terminal = require('term.js');
var io = require('socket.io-client');

/**
 * Get dimensions of a single char inside the element
 *
 * @param {Node} element Element for which to deremine the char size
 */
function getCharSize (element) {
  const temp = document.createElement('span');
  temp.innerHTML = 'x';
  element.appendChild(temp);
  const size = {
    width: temp.offsetWidth,
    height: temp.offsetHeight,
  };
  element.removeChild(temp);
  return size;
}

/**
 * Add terminal to the element and initialize new game session
 *
 * @param {Node} element Container element for the terminal
 * @param {Object} options Game session options
 */
function play (element, _options) {
  var options = Object.assign({
    w: 80,
    h: 24,
  }, _options);

  if (!options.game) {
    throw new Error("Game must be specified in options.");
  }

  var socket = io({query: 'game='+encodeURIComponent(options.game)});

  console.log('connecting');
  socket.on('connect', () => {
    console.log('connected');

    // Initialize the terminal
    var term = new Terminal({
      cols: options.cols,
      rows: options.rows,
      cursorBlink: false
    });

    term.open(element);

    // Resize the terminal to accomidate required size
    var charSize = getCharSize(element);
    element.style.width = options.cols * charSize.width + 'px';
    element.style.height = options.rows * charSize.height + 'px';

    // Request game TTY to be resized to required size
    socket.emit('resize', {
      w: options.cols,
      h: options.rows,
    });

    // Handle IO
    term.on('data', function(data) {
      socket.emit('data', data);
    });
    socket.on('data', function(data) {
      term.write(data);
    });

    // Destroy terminal after disconnecting from the server
    socket.on('disconnect', function() {
      term.destroy();
    });
  });
}

module.exports = play;
