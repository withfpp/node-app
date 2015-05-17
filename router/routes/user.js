var express = require('express')
var router = express.Router()
var ensureAuthentication = require('../../middleware/ensureAuthentication');
var conn = require('../../db');
var User = conn.model('User');
var _ = require('lodash');

router.get('/:userId', function(req, res){
  var userId = req.params.userId;

  User.findOne({id: userId}, function(err, user){
    if (err) return res.sendStatus(500);
    if (!user){
      return res.sendStatus(404);
    }
    console.log(user.toClient())
    res.send({ user: user.toClient() })
  });

});


router.post('/', function(req, res) {
  var user = req.body.user;

  User.create(user, function(err, user){

    if (err){
      var code = err.code === 11000 ? 409 : 500
      return res.sendStatus(code);
    }

    req.login(user, function(err){
      if (err){
        return res.sendStatus(500);
      }
      res.sendStatus(200);
    });

  })
})

router.put('/:userId', ensureAuthentication, function(req, res) {

  var query = { id: req.params.userId }
  var update = { password: req.body.password }

  if (req.user.id !== req.params.userId) {
    return res.sendStatus(403)
  }

  User.findOneAndUpdate(query, update, function(err, user) {
    if (err) {
      return res.sendStatus(500)
    }
    res.sendStatus(200)
  })
})

router.post('/:userId/follow', ensureAuthentication, function(req, res) {

  var userId = req.params.userId

  User.findByUserId(userId, function(err, user) {
    if (err) {
      return res.sendStatus(500)
    }
    if (!user) {
      return res.sendStatus(403)
    }
    req.user.follow(userId, function(err) {
      if (err) {
        return res.sendStatus(500)
      }
      res.sendStatus(200)
    })
  })
})

router.post('/:userId/unfollow', ensureAuthentication, function(req, res) {
  req.user.unfollow(req.params.userId, function(err) {
    if (err) {
      return res.sendStatus(500)
    }
    res.sendStatus(200)
  })
})

router.get('/:userId/friends', function(req, res) {
  var userId = req.params.userId

  User.findByUserId(userId, function(err, user) {
    if (err) {
      return res.sendStatus(500)
    }
    if (!user) {
      return res.sendStatus(404)
    }
    user.getFriends(function(err, friends) {
      if (err) {
        return res.sendStatus(500)
      }
      var friendsList = friends.map(function(user) { return user.toClient() })
      res.send({ users: friendsList })
    })
  })
})

module.exports = router;
