/**
 * Created by leon on 9/05/15.
 */
var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    bcrypt = require('bcrypt'),
    fixtures = require('./fixtures.js'),
    _ = require('lodash'),
    conn = require('./db'),
    User = conn.model('User');



passport.serializeUser(function(user, done){
    done(null, user.id);
});

passport.deserializeUser(function(id, done){
    User.findOne({id: id}, done)
});


function verify(username, password, done){

    User.findOne({ id: username }, function(err, user) {
        if (err) { return done(err); }
        if (!user) {
            console.log('not user')
            return done(null, false, { message: 'Incorrect username.' });
        }

        bcrypt.compare(password, user.password, function(err, matched) {
              if (err) {
                return done(err)
              }
              matched ? 
                done(null, user) : 
                done(null, false, { message: 'Incorrect password.' })
            })
    });
}

passport.use(new LocalStrategy(verify));

module.exports = passport;