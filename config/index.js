var nconf = require('nconf'),
    fs = require('fs'),
    path = require('path');

nconf.env();
var environment = nconf.get('NODE_ENV') || 'dev';

var configFile = 'config-' + environment + '.json';

nconf.file(path.join(__dirname, configFile));

module.exports = nconf;