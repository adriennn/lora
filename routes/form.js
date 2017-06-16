require('dotenv').config();

var express = require('express'),
    formRouter = express.Router(),
    path = require('path'),
    fs = require('fs'),
    validator = require('validator'),
    rpcclient = require(path.join(__dirname,'/../middleware/RPCclient.js'));

var currentdevice = JSON.parse(fs.readFileSync(path.join(__dirname, './../config/device.json'), 'utf8'));

var getParams = function (req, res, next) {

  // process the form with a loop
  // console.log('form data: ', JSON.stringify(req.body));
  for (var key in req.body) {

     if (req.body.hasOwnProperty(key)) {

       res.locals[key] = req.body[key];
     }
  }

  console.log('Saved form data from getParams(): ', res.locals);

  next();
};

var makeManualApiCall = function (req, res, next) {

  console.log('params from makeManualApiCall(): ', res.locals);

  if (res.locals.method) {

    var method = res.locals.method;

    // remove the method from the parameters before the rpc call
    delete res.locals.method;
    console.log('method: ', method);

    rpcclient.request(method, res.locals, function (err, response) {

      if (err) {
        console.log('Jayson RPC client error: ', err);
        // TODO make this via jayson which so far hasn't picked up'
        res.render('response', {"response": {"error": {"code": -32002, "message" : "device not found"}}});
      }

      if (response) {
        console.log(response);
        res.locals.response = response;
        next();
      }
    });

    res.on('http timeout', function (data) {
      console.log('http timeout data: ', data);
    });

    rpcclient.on('http timeout', function(err) {
      console.log('http client timeout error: ', err);
    });

  }
};

var saveRequestToFile = function (req, res, next) {

  // if there's no method field in the request we're saving the data to a file
  if ( !res.locals.method ) {

    console.log("res.locals from saveRequesttoFile(): ", JSON.stringify(res.locals));

    if ( res.locals.command_str.length > 0 ) {

      var mergedpayload = res.locals.command_seq + res.locals.command_str + res.locals.command_val;

      console.log('mergedhexpayload: ', mergedpayload);

      if ( validator.isHexadecimal( mergedpayload ) ) {

            var encryptedpayload = Buffer.from(mergedpayload, 'hex').toString('base64');

            var packet = { "dev_eui" : res.locals.dev_eui,
                           "payload" : mergedpayload,
                           "encrypted_payload": encryptedpayload };

            console.log('packet from saveRequestToFile()', packet);

            fs.writeFileSync(path.join(__dirname, './../config/device.json'), JSON.stringify(packet));

            res.render('response', {'saved': 'Successfully saved to file.'});

        } else {

            res.render('response', {'saved': 'Not a valid hexadecimal payload.'});
      }

    } else {

        res.render('response', {'saved': 'Not saved, payload is mandatory.'});
	}

  } else {
	  // else we're calling from the test form so move to the next middleware
	  next();
  }
};

var renderResponse = function (res, req) {

  // console.log('rendering response: ', req.locals);
  if (req.locals.response) {

    req.render('response', {'response': req.locals.response});

  } else {
    req.render('response', {'saved': 'Not saved, payload is mandatory.'});
  }
};

formRouter.get('/test', function (req, res, next) {
  res.render('test', {
    title: 'Test RPC calls',
    id: 'test'
  });
});

formRouter.get('/listen', function (req, res, next) {

  var iosourceurl = process.env.IO_CONNECT;

  console.log('io source: ', iosourceurl);

  res.render('listen', {
    title: 'Listen to RPC calls',
    id: 'listen',
    iosourceurl: iosourceurl
  });
});

formRouter.get('/send', function (req, res, next) {
  res.render('send', {
    title: 'Send data to a device',
    id: 'send'
  });
});

formRouter.post('*', getParams, saveRequestToFile, makeManualApiCall, renderResponse);

module.exports = formRouter;
