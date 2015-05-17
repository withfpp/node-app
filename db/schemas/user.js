var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');
var _ = require('lodash');

var userSchema = new Schema({
    id: {type: String, unique: true},
    name: String,
    email: {type: String, unique: true},
    password: String,
    followingIds: {type:[String], default: []}
});

userSchema.pre('save', function(next) {
  var _this = this;

  bcrypt.hash(this.password, 10, function(err, passwordHash) {
    if (err) {
      return next(err);
    }
    _this.password = passwordHash;
    next();
  })
});

userSchema.methods.toClient = function(){
	var user = _.pick(this, ['id', 'name'])
	return user;
}

userSchema.statics.findByUserId = function(id, done) {
  this.findOne({ id: id }, done)
}

userSchema.methods.follow = function(userId, done) {
  var update = { $addToSet: { followingIds: userId } }
  this.model('User').findByIdAndUpdate(this._id, update, done)
}

userSchema.methods.unfollow = function(userId, done) {
  var update = { '$pull': { followingIds: userId } }
  this.model('User').findByIdAndUpdate(this._id, update, done)
}

userSchema.methods.getFriends = function(done) {
  this.model('User').find({id: {$in: this.followingIds}}, done)
}

module.exports = userSchema;