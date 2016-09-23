var path = require('path');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var uuid = require('node-uuid');

require('dotenv').config();

var sessionInstance = session({
  store: new FileStore({
    path: path.join(__dirname, 'data', 'sessions'),
  }),
  secret: process.env.SESSION_SECRET,
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
