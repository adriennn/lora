/* Router for RPC interface */
var express = require('express'),
    path = require('path'),
    fs = require('fs'),
    RPCrouter = express.Router(),
    jayson = require('jayson');

var currentdevice = JSON.parse(fs.readFileSync(path.join(__dirname, './../config/device.json'), 'utf8'));

// RPC methods for Everynet and 1m2m devices
var methods = {

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
    
    // console.log('device data in storage: ', JSON.stringify(currentdevice));
    console.log('received DEVEUI in downlink request: ', args.dev_eui);
    
    var deveui = args.dev_eui;
    
    // check that the request matches something already in storage
    for (var key in currentdevice) {
      if (currentdevice.hasOwnProperty(key)) {
        if (key === deveui.toString()) {
          // if there is non alphnum char, exit
          if (!deveui.match(/^[0-9a-z]+$/) && !currentdevice[key].payload.match(/^[0-9a-z]+$/)) {
            done(null, 'error: device not found');
          }

          // if the answer contains TAliveMsg it's from the 1m2m device it will send back the original command as well
          if (args.TAliveMsg) {
            console.log('Alive at: ', args.TAliveMsg);
            console.log('original command: ', args.CmdAck);
            
            // if the downlink contains a confirmed value, remove the payload from the file and save the new file
            if (args.confirmed === true) {
              delete currentdevice[deveui];
              var exportofile = fs.createWriteStream(path.join(__dirname, './../config/device.json'));
              exportofile.write(JSON.stringify(currentdevice));
              done(null, 'ok');
            }

          // else send back a payload
          } else {
            var payloadhex = Buffer.from(currentdevice[key].payload).toString('hex');
            var payload = Buffer.from(payloadhex).toString('base64');
            console.log('base64 PAYLOAD: ', payload);
            console.log('matching keys: ', currentdevice[key]);
            
            var result = {
              "pending": false,
              "confirmed": false,
              "payload": payload
            };
            console.log('sending away payload');
            done(null, result);
          }
        } 
      } 
      if (!currentdevice.hasOwnProperty(key)) {
        done(null, 'error: device not found');
      }
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
    var result = args.dev_eui + 'invalid' + args.api_key;
    done(null, result);
  }, {
    collect: true,
    params: { 
      "dev_eui": "NoDeviceSet", 
      "api_key": "NoApiKeySet"
    }
  }),
};

RPCrouter.post('*', function(req, res, next) {
  console.log(req.body);
  req.io.sockets.emit("rpcrequest", req.body);
  next();
});

// Any request coming to https://garbagepla.net/lora/rpc will be handled by the jayson server
var jaysonserver = jayson.server(methods, {params: Object});
// set extra error codes


RPCrouter.use('/', jaysonserver.middleware());

module.exports = RPCrouter;