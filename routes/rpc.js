/* Router for RPC interface */
var express = require('express'),
    path = require('path'),
    RPCrouter = express.Router(),
    jayson = require('jayson');


var methods = {
  // null is a palceholder for the error object
  uplink: function(a, b, callback) {
    console.log(callback.toString());
    callback(null, 'this uplink router');
  },
  status: function(args, callback) {
    callback(null, 'my status router');
  },
  downlink: function(args, callback) {
    callback(null, 'downlink router');
  },
  post_uplink: function(args, callback) {
    // network server sends (to the app) payloads received from other gateways as
    // a bundle after the first payload has hit the app.
    callback(null, 'hello post_uplink router');
  },
  notify: function(args, callback) {
    // network server sends (to the app) payloads received from other gateways as
    // a bundle after the first payload has hit the app.
    callback(null, 'hello notify router');
  }
};

// Any request coming to garbagepla.net/lora/rpc will be handled by the jayson server
// and the response will be rendered
RPCrouter.use('/', jayson.server(methods, {
  collect: false,
  params: Array
}).middleware());

module.exports = RPCrouter;