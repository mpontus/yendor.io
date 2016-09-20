var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});
router.get('/play/rogue', function(req, res, next) {
  res.render('play/rogue');
});
router.get('/play/nethack', function(req, res, next) {
  res.render('play/nethack');
});
router.get('/play/brogue', function(req, res, next) {
  res.render('play/brogue');
});
router.get('/session', function (req, res, next) {
  if (!req.session.playerid) {
    res.write("Initializing new: ");
    req.session.playerid = require('node-uuid').v4();
  }
  res.end(req.session.playerid);
});

router.get('/reset', function (req, res, next) {
  req.session.playerid = null;
  res.end();
});

module.exports = router;
