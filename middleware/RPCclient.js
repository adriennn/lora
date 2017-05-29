var jayson = require('jayson');

// var core_url = 'api.everynet.com';
// var core_url = 'https://core.eu-west-1.everynet.io/v1/rpc';
var core_url = 'http://127.0.0.1:5000/lora/rpc';
// var core_url = 'https://garbagepla.net/lora/rpc';

// TODO if (core_url.indexOf(http || https ))
// TODO allow to choose url for testing form

var client = jayson.client.http(core_url);

client.on('http request', function(req) {
  req.setTimeout(5000);
});

module.exports = client;