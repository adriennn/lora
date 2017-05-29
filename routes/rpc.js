/* Router for RPC interface */
var express = require('express'),
    path = require('path'),
    fs = require('fs'),
    RPCrouter = express.Router(),
    jayson = require('jayson');

var currentdevice = JSON.parse(fs.readFileSync(path.join(__dirname, './../config/device.json'), 'utf8'));
var payload = currentdevice['payload'];
var packetsdatabase = JSON.parse(fs.readFileSync(path.join(__dirname, './../config/packets.json'), 'utf8'));

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
    
    // append to JSON object
    packetsdatabase[args.dev_eui];
          
    var savetofile = fs.createWriteStream(path.join(__dirname, './../config/packets.json'));
    savetofile.write(JSON.stringify(packetsdatabase));
    
    // TODO send to socket via external function and render via 1m2m API
    // http://1m2m.eu/services/GETPAYLOAD?Human=0&PL=020004370bc6140000fe000000000000
    
    done(null, 'ok');
  }),
  outdated: function (args, callback) {
    
   /* Parameters in the request
    * same as in uplink method
    * this method delivers packets that were accumulated while application
    * was unable to receive request from the network server [batch]
    */
    
    callback(null, 'ok');
  },
  status: function (args, callback) {
    
   /* Parameters in the request
    * args.dev_eui
    * args.dev_addr
    * args.battery [battery level: 1-254, 0=external power source, 255=unknown]
    * args.snr [signal to noise ratio]
    */
    
    callback(null, 'ok');
  },
  satus_request: function (args, callback) {
    
   /* Parameters in the request
    * 
    * args.api_key
    * args.dev_eui
    */
    
    callback(null, 'ok');
  },
  downlink: jayson.Method(function (args, done) {
    
    /* Parameters in the request
     * args.dev_eui
     * args.dev_addr
     * args.tx_time
     * args.max_size
     * args.counter_down
     */
    
    // console.log('device data in storage: ', JSON.stringify(currentdevice));
        
    // check that the request matches something already in storage
    /* for (var key in currentdevice) {
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
            console.log('matching keys: ', currentdevice[key]);*/
    
        // var payloadhex = Buffer.from('01FDfe8af05f2b5d6ced', 'hex');
        
        if (!payload) {
          
            done(null, null);
          
		// if the dev_eui from the Network Server matches what's on file we send the payload
        } else if (args.dev_eui == currentdevice['dev_eui']) {
          
            var result = { "pending": false,
                           "confirmed": false,
                           "payload": payload };
          
            done(null, result);
          
            // TODO need to check for Network Server response
            // if (network.server.response = ok) { 
            //   delete currentdevice['dev_eui']
            //   var exportofile = fs.createWriteStream(path.join(__dirname, './../config/device.json'));
            //   exportofile.write(JSON.stringify(currentdevice));
            // }
          
        }  else {
          
            done(null, null);
          
        }
  }),
  post_uplink: function (args, callback) {
    
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
  notify: function (args, callback) {

   /* Parameters in the request
    * only for always-on 'class C' devices
    * notifies the network server of packets available for uplink
    * network server then emits a 'downlink' request which can be replied to with a payload
    * args.api_key
    * args.dev_eui
    */
    
    callback(null, 'ok');
  },
  join: jayson.Method (function(args, done) {
    
      var result = { 'dev_eui' : args.dev_eui,
                     'api_key' : args.api_key }
      
      done(null, result);
  })
  
};

RPCrouter.post('*', function(req, res, next) {
	
  // var io = req.app.get('socketio');
  
  console.log('req value from RPCRouter.post(): ', req.body);
	
  // io.emit("rpcrequest", req.body);

  req.io.sockets.emit("rpcrequest", req.body);
  
  next();
});

// Any request coming to https://garbagepla.net/lora/rpc will be handled by the jayson server
var jaysonserver = jayson.server(methods, {params: Object});

RPCrouter.use('/', jaysonserver.middleware());

module.exports = RPCrouter;