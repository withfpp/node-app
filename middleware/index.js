
module.exports = function(app){

	var bodyParser = require('body-parser');
	var session = require('express-session');
	var cookieParser = require('cookie-parser');
	var passport = require('../auth');


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


}