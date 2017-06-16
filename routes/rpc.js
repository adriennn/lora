/* Router for RPC interface */
var express = require('express'),
    path = require('path'),
    fs = require('fs'),
    RPCrouter = express.Router(),
    jayson = require('jayson'),
    http = require('http');

var exportDataToFile = function exportDataToFile (ref, data) {

    switch (ref) {

      case 'uplink' :

          var packetsdatabase = JSON.parse(fs.readFileSync(path.join(__dirname, './../config/packets.json'), 'utf8'));
          var data = data;

          packetsdatabase.push(data);

          fs.writeFileSync(path.join(__dirname, './../config/packets.json'), JSON.stringify(packetsdatabase));

          break;

      case 'erase' :

          fs.writeFileSync(path.join(__dirname, './../config/device.json'), JSON.stringify({}));

          break;
    }
};

var decode1m2mpayload = function (obj) {

    return new Promise ( function (resolve, reject) {

        console.log('1m2m payload to make human readable: ', obj);

        var hex_o =  Buffer.from(obj.toString(), 'base64').toString('hex');
        var url = 'http://1m2m.eu/services/GETPAYLOAD?Human=0&PL=' + hex_o;

        http.get(url, function (res) {

            const { statusCode } = res;
            const contentType = res.headers['content-type'];

            let error;

            if (statusCode !== 200) {

                error = new Error('Request Failed.\n' +
                                `  Status Code: ${statusCode}`);
            }

            if (error) {

                console.error(error.message);
                // consume response data to free up memory
                res.resume();
                return;
            }

            let rawData = '';

            res.on('data', function (chunk) { rawData += chunk; });

            res.on('end', function () {

              try {
                  const parsedData = JSON.parse(rawData);
                  console.log('Parsed response data', parsedData.toString());
                  resolve( parsedData );

              } catch (e) {
                  console.error(e.message);
              }
            });

        }).on('error', (e) => {
          console.error(`Got error: ${e.message}`);
        });
    });
};

var getQualityIndex = function (AnIn1, AnIn2) {

    var quality;

    if ( AnIn1 < 250 && AnIn2 < 250 ) {
        quality = 'clean';
    } else if ( AnIn1 < 250 && AnIn2 > 3000 ) {
        quality = 'light';
    } else if ( AnIn1 > 3000 && AnIn2 < 250 ) {
        quality = 'medium';
    } else if ( AnIn1 > 3000 && AnIn2 > 3000 ) {
        quality = 'high';
    }

    return quality;
};

var convertTime = function (s) {

    // var jstime = s * 1e3;

    return new Date(s * 1e3).toISOString().slice(-13, -5);

};

var catchRpc = function catchRpc (req, res, next) {

    var io = req.app.get('socketio');

    console.log('req value from RPCRouter.post(*): ', req.body);

    // Make the time readable
    if ( req.body.params.rx_time || req.body.params.tx_time ) {

        var unixtime = req.body.params.rx_time ? req.body.params.rx_time : req.body.params.tx_time;

        req.body.params.human_time = convertTime(unixtime);
    }

    // Create a promise for decoding the 1m2m payload before sending it to the listen.pug view
    if (req.body.params.payload) {

        decode1m2mpayload(req.body.params.payload).then( function (obj) {

              req.body.params.human_payload = obj;

              // set the polluton scale for the winsen ZP01-MP503 module if the analog data is present
              if (req.body.params.human_payload.MsgID == 'Analog') {

                  req.body.params.pollution_level = getQualityIndex(parseInt(req.body.params.human_payload.AnIn1, 10), parseInt(req.body.params.human_payload.AnIn2, 10));
              }

              console.log('Added decoded payload to req.body: ', req.body);

              io.emit("rpcrequest", req.body);

              next();
        }) ;

    } else {

        io.emit("rpcrequest", req.body);

        next();
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
  downlink: jayson.Method( function (args, done) {

      // Make a Redis DB and work from there
      var currentdevice = JSON.parse(fs.readFileSync(path.join(__dirname, './../config/device.json'), 'utf8'));

    /* Parameters in the request
     * args.dev_eui
     * args.dev_addr
     * args.tx_time
     * args.max_size
     * args.counter_down
     */

      if ( !currentdevice.encrypted_payload ) {

          console.log('encrypted payload missing');

          done(null, { "pending": false,
                       "confirmed": false,
                       "payload": "" });


      // if the dev_eui from the Network Server matches what's on file we send the payload
      } else if ( currentdevice.encrypted_payload && args.dev_eui == currentdevice.dev_eui ) {

          var result = { "pending": false,
                         "confirmed": false,
                         "payload": currentdevice.ncrypted_payload };

          exportDataToFile('erase', {});

          done(null, result);

      }  else {

          console.log('nothing in storage');

          done(null, { "pending": false,
                       "confirmed": false,
                       "payload": "" });
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
  join: jayson.Method (function (args, done) {

      /*
       * The join() method is not called if app_key was provided to the network by the user
       */

        done(null, 'ok');
  })

};

// Any request coming to /lora/rpc will be handled by the jayson server
var jaysonserver = jayson.server(methods, {params: Object});

RPCrouter.post('*', catchRpc, jaysonserver.middleware());

module.exports = RPCrouter;
