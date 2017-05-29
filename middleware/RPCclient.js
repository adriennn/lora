require('dotenv').config();
var jayson = require('jayson');


var client_url = process.env.CLIENT_URL;
console.log('rpc client url', client_url);

var https = process.env.HTTPS;

var client = https? jayson.client.https(client_url) : jayson.client.http(client_url);

client.on('http request', function(req) {
  req.setTimeout(5000);
});

module.exports = client;