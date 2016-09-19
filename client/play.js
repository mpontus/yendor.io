import Terminal from 'term.js';
import io from 'socket.io-client';

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

export default function play (element, _options = {}) {
  const _defaults = {
    cols: 80,
    rows: 24,
  };

  const options = Object.assign({}, _defaults, _options);

  if (!options.game) {
    throw new Error("Option 'game' must be specified.");
  }

  const socket = io({query: 'game='+encodeURIComponent(options.game)});

  socket.on('connect', () => {
    const term = new Terminal({
      cols: options.cols,
      rows: options.rows,
      cursorBlink: false
    });

    term.open(element);

    const charSize = getCharSize(element);
    element.style.width = options.cols * charSize.width + 'px';
    element.style.height = options.rows * charSize.height + 'px';

    term.on('data', function(data) {
      socket.emit('data', data);
    });

    socket.on('data', function(data) {
      term.write(data);
    });

    socket.on('disconnect', function() {
      term.destroy();
    });
  });
}

