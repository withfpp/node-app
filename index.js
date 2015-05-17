var express = require('express');
var fixtures = require('./fixtures');
var _ = require('lodash');
var config = require('./config/index');
var app = express();

require('./middleware')(app);
require('./router')(app);



var server = app.listen(config.get('server:port'), config.get('server:host'));

module.exports = server;