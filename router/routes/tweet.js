var express = require('express')
var router = express.Router()
var ensureAuthentication = require('../../middleware/ensureAuthentication');
var conn = require('../../db');
var Tweet = conn.model('Tweet');
var _ = require('lodash');


router.get('/', function(req, res) {
  if (!req.query.userId) {
    return res.sendStatus(400)
  }

  var query = { userId: req.query.userId }
  var options = { sort: { created: -1 } }

  Tweet.find(query, null, options, function(err, tweets) {
    if (err) {
      return res.sendStatus(500)
    }
    var responseTweets = tweets.map(function(tweet) { return tweet.toClient() })
    res.send({ tweets: responseTweets })
  })
})


router.get('/:tweetId', function(req, res) {

  Tweet.findById(req.params.tweetId, function(err, tweet){
    if (err) {
      return res.sendStatus(500);
    }

    if (!tweet){
      return res.sendStatus(404);
    }
    
    res.send({ tweet: tweet.toClient() });
  });

});



router.post('/', ensureAuthentication, function(req, res, next){

  var tweetData = req.body.tweet
  tweetData.userId = req.user.id;
  tweetData.created = Date.now() / 1000 | 0;

  Tweet.create(tweetData, function(err, tweet){
    if (err) return res.sendStatus(500)
    res.status(200).send({tweet: tweet.toClient()})
  })
})

router.delete('/:tweetId', ensureAuthentication, function(req, res) {
  var tweetId = req.params.tweetId;
  
  Tweet.findById(tweetId, function(err, tweet){
    if(tweet === null) return res.sendStatus(404);
    if(tweet.userId !== req.user.id) return res.sendStatus(403);
    tweet.remove(function(){
      res.sendStatus(200)
    })
  })

})

module.exports = router;