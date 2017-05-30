/* Router for RPC interface */
var express = require('express'),
    path = require('path'),
    fs = require('fs'),
    RPCrouter = express.Router(),
    jayson = require('jayson'),
    exportDataToFile = require(path.join(__dirname,'/../middleware/exportData.js'));



var exportDataToFile = function exportDataToFile (ref, data) {
  
    switch (ref) {
        
      case 'uplink' :
        
          var packetsdatabase = JSON.parse(fs.readFileSync(path.join(__dirname, './../config/packets.json'), 'utf8'));
          var data = data;
        
          // TODO send to 1m2m API for decrypt
          // http://1m2m.eu/services/GETPAYLOAD?Human=0&PL=020004370bc6140000fe000000000000
  
          // data.decrypted_payload;
        
          packetsdatabase.push(data);
    
          fs.writeFileSync(path.join(__dirname, './../config/packets.json'), JSON.stringify(packetsdatabase)); 
        
      break;
    }
};

// RPC methods for Everynet and 1m2m devices
var methods = {
  
  uplink: jayson.Method(function (args, done) {

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
    
    console.log('data from uplink() method', args);

    exportDataToFile('uplink', args);
    
    done(null, 'ok');
  }),
  outdated: function (args, done) {
    
   /* Parameters in the request
    * same as in uplink method
    * this method delivers packets that were accumulated while application
    * was unable to receive request from the network server [batch]
    */
    
    done(null, 'ok');
  },
  status: function (args, done) {
    
   /* Parameters in the request
    * args.dev_eui
    * args.dev_addr
    * args.battery [battery level: 1-254, 0=external power source, 255=unknown]
    * args.snr [signal to noise ratio]
    */
    
    done(null, 'ok');
  },
  satus_request: function (args, done) {
    
   /* Parameters in the request
    * 
    * args.api_key
    * args.dev_eui
    */
    
    done(null, 'ok');
  },
  downlink: jayson.Method(function (args, done) {
    
      // TODO we need to be able to reload these files each time a new downlink call comes in and yet the
      // downlink method below must remain lean and fast
      // Make a Redis DB and work from there
    
      var currentdevice = JSON.parse(fs.readFileSync(path.join(__dirname, './../config/device.json'), 'utf8'));
      var encryptedpayload = currentdevice.encrypted_payload;
      var deveui = currentdevice.dev_eui;
    
    /* Parameters in the request
     * args.dev_eui
     * args.dev_addr
     * args.tx_time
     * args.max_size
     * args.counter_down
     */
    
    /* We must reply with 'null' if there's no more packet to be uploaded. */
    
    // TODO build and check packet queue
    
      if ( !encryptedpayload ) {

          console.log('encypted payload missing');
        
          done();

      // if the dev_eui from the Network Server matches what's on file we send the payload
      } else if ( encryptedpayload && args.dev_eui == deveui ) {

          var result = { "pending": false,
                         "confirmed": false,
                         "payload": encryptedpayload };

          done(null, result);

      }  else {

          // TODO revert with Device Not Found error
          console.log('nothing in storage');
        
          done();
      }
  }),
  post_uplink: function (args, done) {
    
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
    
    done(null, 'ok');
  },
  notify: function (args, done) {

   /* Parameters in the request
    * only for always-on 'class C' devices
    * notifies the network server of packets available for uplink
    * network server then emits a 'downlink' request which can be replied to with a payload
    * args.api_key
    * args.dev_eui
    */
    
    done(null, 'ok');
  },
  join: jayson.Method (function(args, done) {
    
      var result = { 'dev_eui' : args.dev_eui,
                     'api_key' : args.api_key };
          
      done(null, result);
  })
  
};

// Any request coming to https://garbagepla.net/lora/rpc will be handled by the jayson server
var jaysonserver = jayson.server(methods, {params: Object});

var catchRpc = function catchRpc (req, res, next) {
	
  var io = req.app.get('socketio');
  
  console.log('req value from RPCRouter.post(*): ', req.body);
	
  io.emit("rpcrequest", req.body);

  next();
};

RPCrouter.post('*', catchRpc, jaysonserver.middleware());

module.exports = RPCrouter;