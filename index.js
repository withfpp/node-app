var express = require('express');
var fixtures = require('./fixtures');
var bodyParser = require('body-parser');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var _ = require('lodash');
var passport = require('./auth');
var config = require('./config/index');
var conn = require('./db');
var User = conn.model('User');
var Tweet = conn.model('Tweet');


var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))


app.use(passport.initialize())
app.use(passport.session())


app.get('/api/tweets/:tweetId', function(req, res) {
  var tweet = _.find(fixtures.tweets, 'id', req.params.tweetId)

  if (!tweet) {
    return res.sendStatus(404)
  }

  res.send({ tweet: tweet })
});

app.delete('/api/tweets/:tweetId', ensureAuthentication, function(req, res) {

  var tweet = _.find(fixtures.tweets, 'id', req.params.tweetId);

  if(!tweet){
    return res.sendStatus(404)
  }

  if(tweet.userId !== req.user.id){
    return res.sendStatus(403);
  }

  _.remove(fixtures.tweets, 'id', req.params.tweetId);

  res.sendStatus(200);

})

function ensureAuthentication(req, res, next){
  if(req.isAuthenticated()) {
    return next();
  }
  res.sendStatus(403)
}

app.post('/api/users', function(req, res) {
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

app.get('/api/users/:userId', function(req, res){
  var userId = req.params.userId;

  User.findOne({id: userId}, function(err, user){
    if (err) return res.sendStatus(500);
    if (!user){
      return res.sendStatus(404);
    }
    res.send({user: user});
  });

});

app.put('/api/users/:userId', ensureAuthentication, function(req, res) {

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

app.post('/api/tweets', ensureAuthentication, function(req, res, next){

  var tweetData = req.body.tweet
  tweetData.userId = req.user.id;
  tweetData.created = Date.now() / 1000 | 0;

  Tweet.create(tweetData, function(err, tweet){
    if (err) return res.sendStatus(500)
    res.status(200).send({tweet: tweet.toClient()})
  })
})

app.post('/api/auth/login', function(req, res, next){
  passport.authenticate('local', function(err, user, info){
    if (err) { return res.sendStatus(500); }
    if (!user) { return res.sendStatus(403); }
    req.logIn(user, function(err) {
      if (err) { return res.sendStatus(500); }
      return res.status(200).send({user: user});
    });
  })(req, res, next);
});

app.post('/api/auth/logout', function(req, res, next){
  req.logout();
  res.sendStatus(200);
});

var server = app.listen(config.get('server:port'), config.get('server:host'));

module.exports = server;