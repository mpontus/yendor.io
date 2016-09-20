var session = require('express-session');
var uuid = require('node-uuid');

var sessionInstance = session({
  secret: '0b037d7773cead92485e114839b3bd27b5ddcec7',
  resave: true,
  saveUninitialized: true,
})

module.exports = function (req, res, next) {
  return sessionInstance(req, res, function() {
    if (!req.session.playerid) {
      req.session.playerid = uuid.v4();
    }
    next();
  });
};
