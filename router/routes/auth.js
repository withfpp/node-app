var express = require('express')
var router = express.Router()
var ensureAuthentication = require('../../middleware/ensureAuthentication');
var passport = require('../../auth');
var _ = require('lodash');

router.post('/login', function(req, res, next){
  passport.authenticate('local', function(err, user, info){
    if (err) { return res.sendStatus(500); }
    if (!user) { return res.sendStatus(403); }
    req.logIn(user, function(err) {
      if (err) { return res.sendStatus(500); }
      return res.status(200).send({user: user.toClient()});
    });
  })(req, res, next);
});

router.post('/logout', function(req, res, next){
  req.logout();
  res.sendStatus(200);
});


module.exports = router;