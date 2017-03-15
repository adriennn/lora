/* Router for RPC interface */
var express = require('express'),
    path = require('path'),
    RPCrouter = express.Router(),
    jayson = require('jayson');

// RPC methods for Everynet and 1m2m devices
var methods = {
  setAPPEUI: function() {
    // if ()
    var CmdSeq = 0x01,
        Cmd = 0xFD,
        APPEUI = 00000000;
    
    return (CmdSeq +1) + Cmd + APPEUI;
    
  },
  setABP: function() {
    
    var CmdSeq = 0x01,
        Cmd = 0xFC,
        DevAddr = 0000,
        AppSKey = 0000000000000000,
        NwSKey = 0000000000000000;
    
    return (CmdSeq +1) + Cmd + DevAddr + AppSKey + NwSKey;
  },
  uplink: function(args, callback) {

   /* Parameters in the request
    * uplink method only needs to return 'ok'
    * args.dev_eui
    * args.dev_addr
    * args.rx_time
    * args.counter_up
    * args.port
    * args.encrypted_payload
    * args.radio [includes numerous sub params]
    */
    
    callback(null, 'ok');
    // do something with the incoming data like save to db
  },
  outdated: function(args, callback) {
    
   /* Parameters in the request
    * same as in uplink method
    * this method delivers packets that were accumulated while application
    * was unable to receive request from the network server [batch]
    */
    
    callback(null, 'ok');
  },
  status: function(args, callback) {
    
   /* Parameters in the request
    * args.dev_eui
    * args.dev_addr
    * args.battery [battery level: 1-254, 0=external power source, 255=unknown]
    * args.snr [signal to noise ratio]
    */
    
    callback(null, 'ok');
  },
  satus_request: function(args, callback) {
    
   /* Parameters in the request
    * 
    * args.api_key
    * args.dev_eui
    */
    
    callback(null, 'ok');
  },
  downlink: jayson.Method(function(args, done) {
    
    /* Parameters in the request
     * args.dev_eui
     * args.dev_addr
     * args.tx_time
     * args.max_size
     * args.counter_down
     */
    
    // TODO check if we need to set APPEUI or set ABP
    
    var result = {
        "dev_eui": args.dev_eui,
        "pending": true,
        "confirmed": true,
        "payload": Buffer.from(methods.setAPPEUI(), 'base64').toString('utf-8')
      };
      done(null, result);
    }, {
      collect: true,
      params: { 
        pending: false, 
        confirmed: false
      }
  }),
  post_uplink: function(args, callback) {
    
   /* Parameters in the request
    * this type of request contains redundant packets obtained through other gateways
    * only the timestamp for aquisition by the gateway varies
    * args.dev_eui
    * args.dev_addr
    * args.rx_time
    * args.counter_up
    * args.port
    * args.encrypted_payload
    * args.radio [includes numerous sub params]
    */
    
    callback(null, 'ok');
  },
  notify: function(args, callback) {

   /* Parameters in the request
    * only for always-on 'class C' devices
    * notifies the network server of packets available for uplink
    * network server then emits a 'downlink' request which can be replied to with a payload
    * args.api_key
    * args.dev_eui
    */
    
    callback(null, 'ok');
  },
  join: jayson.Method(function(args, done) {
    var result = args.dev_eui + ' WAZAAA ' + args.api_key;
    done(null, result);
  }, {
    collect: true,
    params: { dev_eui: "NoDeviceSet", api_key: "NoApiKeySet"} // map of defaults
  }),
};

// Any request coming to garbagepla.net/lora/rpc will be handled by the jayson server
// and the response will be rendered
RPCrouter.use('/', jayson.server(methods, {params: Object}).middleware());

RPCrouter.post('/', function(req, res) {
  // TODO need socket.io to have live feed of incoming packets
  res.json('listen', {'request': req.body});
});

module.exports = RPCrouter;