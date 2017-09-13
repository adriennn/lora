var jayson = require('jayson'),
    utils = require('./utils.js'),
    path = require('path'),
    fs   = require('fs');

var methods = {

    uplink: jayson.Method(function (args, done) {

        utils.exportDataToFile('uplink', args);

        done(null, 'ok');
    }),

    outdated: function (args, done) {

        done(null, 'ok');
    },

    status: function (args, done) {

        done(null, 'ok');
    },

    satus_request: function (args, done) {

        done(null, 'ok');
    },

    downlink: jayson.Method( function (args, done) {

        var currentdevice = JSON.parse(fs.readFileSync(path.join(__dirname, './../config/device.json'), 'utf8'));

        if ( !currentdevice.encrypted_payload ) {

            console.log('encrypted payload missing');

            done(null, {
                "pending": false,
                "confirmed": false,
                "payload": ""
            });

        // if the dev_eui from the Network Server matches what's on file we send the payload
        } else if ( currentdevice.encrypted_payload && args.dev_eui == currentdevice.dev_eui ) {

            var result = {
                "pending": false,
                "confirmed": false,
                "payload": currentdevice.encrypted_payload
            };

            utils.exportDataToFile('erase', {});

            console.log('sending payload');

            done(null, result);

        }  else {

            console.log('nothing in storage');

            done(null, {
                "pending": false,
                "confirmed": false,
                "payload": ""
            });
        }
    }),

    post_uplink: function (args, done) {

        done(null, 'ok');
    },

    notify: function (args, done) {

        done(null, 'ok');
    },

    join: jayson.Method (function (args, done) {

        done(null, 'ok');
    })
};

module.exports = methods;
