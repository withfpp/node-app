var express = require('express');
var fixtures = require('./fixtures');
var bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.post('/api/users', function(req, res){

  for (var i = 0; i < fixtures.users.length; i++) {
    if (fixtures.users[i].id === req.body.user.id){
      return res.sendStatus(409);  //conflict
    }
  };

  var obj = req.body.user;
  obj.followingIds = [];
  fixtures.users.push(obj);
  return res.send(obj)
  
  //-------------------------------------------------solution
  // var _ = require('lodash')
  //   , bodyParser = require('body-parser')

  // app.use(bodyParser.json())

  // app.post('/api/users', function(req, res) {
  //   var user = req.body.user

  //   if (_.find(fixtures.users, 'id', user.id)) {
  //     return res.sendStatus(409)
  //   }

  //   user.followingIds = []
  //   fixtures.users.push(user)

  //   res.sendStatus(200)
  // })
});

app.get('/api/users/:userId', function(req, res){
  var userId = req.params.userId;
  var user = null;
  for (var i = 0; i < fixtures.users.length; i++) {
    if(fixtures.users[i].id === userId){
      user = fixtures.users[i];
    }
  }

  if (!user){
    return res.sendStatus(404);
  }

  return res.send({
    user: user
  });
})

app.get('/api/tweets', function(req, res){
  var userId = req.query.userId;

  if(!userId){
    return res.sendStatus(400);
  }

  var tweets = [];
  for (var i = 0; i < fixtures.tweets.length; i++) {
    if (fixtures.tweets[i].userId === userId){
      tweets.push(fixtures.tweets[i]);
    }
  };

  var sortedTweets = tweets.sort(function(t1, t2){
    if (t1.created > t2.created){
      return -1;
    }else if (t1.created === t2.created){
      return 0;
    }else{
      return 1;
    }
  });

  return res.send({
    tweets: sortedTweets
  });
});



var server = app.listen(3000,'127.0.0.1');

module.exports = server;