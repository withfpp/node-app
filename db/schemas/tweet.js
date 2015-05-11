var mongoose = require('mongoose')
var Schema = mongoose.Schema;
var _ = require('lodash');

var tweetSchema = new Schema({
    userId: String,
    created: {type: Number},
    text: String
});
//
//tweetSchema.methods.toClient = function(){
//    var obj = {
//        id: this._id,
//        text: this.text,
//        created: this.created,
//        userId: this.userId
//    };
//    return obj
//}

tweetSchema.methods.toClient = function() {
    var tweet = _.pick(this, ['userId', 'created', 'text'])
    tweet.id = this._id

    return tweet
}

module.exports = tweetSchema;