/**
 * Created by leon on 9/05/15.
 */
var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
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
        if (user.password !== password) {
            return done(null, false, { message: 'Incorrect password.' });
        }
        return done(null, user);
    });
}

passport.use(new LocalStrategy(verify));

module.exports = passport;