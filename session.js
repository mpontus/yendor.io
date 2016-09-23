var session = require('express-session');
var uuid = require('node-uuid');

require('dotenv').config();

var sessionInstance = session({
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
