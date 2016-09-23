var fs = require('fs');
var $ = require('jquery');
var Terminal = require('term.js');
var io = require('socket.io-client');

var Game = function(options) {
  if (!(this instanceof Game)) return new Game(options);
  this.options = options;
  this.element = $('<div class="game"></div>').get(0);
  this.socket = null;
  this.status = null;
  this.term = null;
};

Game.prototype.initialize = function() {
  this.connect();
  this.initializeTerminal();
  this.initializeStatusScreen();
  this.initializeEndGameScreen();

  this.status = 'connecting';
  this.updateStatusScreen();
};


Game.prototype.connect = function() {
  this.socket = io({
    query: 'game='+encodeURIComponent(this.options.game),
  });

  var _this = this;
  this.socket.on('connect', function() {
    _this.socket.emit('resize', {
      w: _this.options.cols,
      h: _this.options.rows,
    });
  });

  this.socket.on('status', function(status) {
    _this.status = status;
    _this.updateStatusScreen();
  });

  var started = false;
  this.socket.on('data', function() {
    if (!started) {
      started = true;
      _this.hideStatusScreen();
    }
  });

  this.socket.on('disconnect', function() {
    _this.handleGameEnd();
  });
};

Game.prototype.initializeTerminal = function() {
  this.term = new Terminal({
    cols: this.options.cols,
    rows: this.options.rows,
    cursorBlink: false,
  });

  this.term.open(this.element);

  var height = $('.terminal', this.element).outerHeight(),
      width = $('.terminal', this.element).outerWidth();
  $(this.element).css({ width: width, height: height });

  var _this = this;
  this.socket.on('data', function(data) {
    _this.term.write(data);
  });
  this.term.on('data', function(data) {
    _this.socket.emit('data', data);
  });
};

Game.prototype.initializeStatusScreen = function() {
  var _this = this;
  fs.readFile(__dirname + '/statusScreen.html', function(err, contents) {
    $(contents.toString()).appendTo(_this.element);
  });
};

Game.prototype.initializeEndGameScreen = function() {
  var _this = this;
  fs.readFile(__dirname + '/endGameScreen.html', function(err, contents) {
    $(contents.toString()).appendTo(_this.element);
    $('.end-game-screen .end-game-restart').click(function() {
      window.location.reload();
    });
  });
};

Game.prototype.updateStatusScreen = function() {
  var _this = this;
  console.log(this.status);
  $('.status-screen .status-message', this.element).text((function() {
    switch(_this.status) {
      case 'connecting': return "Connecting to Server"
      case 'creating':   return "Creating Container";
      case 'starting':   return "Starting Container";
      case 'attaching':  return "Attaching to Container";
      default:           return "Launching game";
    }
  })());
};

Game.prototype.hideStatusScreen = function() {
  $('.status-screen', this.element).each(function () {
    $(this).fadeOut(1000, function () {
      $(this).hide();
    });
  });
};

Game.prototype.showEndGameScreen = function() {
  $('.end-game-screen', this.element).each(function () {
    $(this).fadeIn(1000);
  });
};

Game.prototype.handleGameEnd = function () {
  var _this = this;
  setTimeout(function () {
    _this.showEndGameScreen();
  }, 1000);
}

module.exports = Game;
