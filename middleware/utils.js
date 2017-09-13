var path = require('path'),
    fs   = require('fs');

var utils = {};

utils.exportDataToFile = function (ref, data) {

      switch (ref) {

        case 'uplink' :

            var packetsdatabase = JSON.parse(fs.readFileSync(path.join(__dirname, './../config/packets.json'), 'utf8'));;
                packetsdatabase.push(data);

            fs.writeFileSync(path.join(__dirname, './../config/packets.json'), JSON.stringify(packetsdatabase));
            break;

        case 'cmdack' :

            var commandqueue = JSON.parse(fs.readFileSync(path.join(__dirname, './../config/command_queue.json'), 'utf8'));
                commandqueue[data.dev_eui] = data.cmd_ack;

            fs.writeFileSync(path.join(__dirname, './../config/packets.json'), JSON.stringify(commandqueue));
            break;

        case 'erase' :

            fs.writeFileSync(path.join(__dirname, './../config/device.json'), JSON.stringify({}));
            break;
      }
},

utils.catchRpc = function (req, res, next) {},

utils.decode1m2mpayload = function (obj) {

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

},

utils.getQualityIndex = function (AnIn1, AnIn2) {

    return
    AnIn1 < 250  && AnIn2 < 250  ? 'clean'  :
    AnIn1 < 250  && AnIn2 > 3000 ? 'light'  :
    AnIn1 > 3000 && AnIn2 < 250  ? 'medium' :
                                   'high'   ;
},

utils.convertTime = function (s) {
    return new Date(s * 1e3).toISOString().slice(-13, -5);
}

module.exports = utils;
