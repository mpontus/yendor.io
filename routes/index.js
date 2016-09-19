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

module.exports = router;
