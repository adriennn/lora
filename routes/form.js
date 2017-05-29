var express = require('express'),
    formRouter = express.Router(),
    path = require('path'),
    fs = require('fs'),
    validator = require('validator'),
    client = require(path.join(__dirname,'/../middleware/RPCclient.js'));

var currentdevice = JSON.parse(fs.readFileSync(path.join(__dirname, './../config/device.json'), 'utf8'));

formRouter.get('/device', function (req, res, next) {
  res.render('device', {
    title: 'Add or register a device',
    id: 'device'
  });
});

formRouter.get('/listen', function (req, res, next) {
  res.render('listen', {
    title: 'Listen to RPC calls',
    id: 'listen'
  });
});

formRouter.get('/send', function (req, res, next) {
  res.render('send', {
    title: 'Send data to a device',
    id: 'send'
  });
});

var getParams = function (req, res, next) {

  // process the form with a loop
  // console.log('form data: ', JSON.stringify(req.body));
  for (var key in req.body) {
	  
     if (req.body.hasOwnProperty(key)) {
		 
       res.locals[key] = req.body[key];
     }
  }
  
  console.log('Saved form data: ', res.locals);
  
  next();
};

var set1m2mCommandString = function (command, payload) {
  
  // TODO increment command counts for each dev_eui separately in ./config/device.json
    
  switch (command) {
    case 'reboot': return '0xFEFEFE';
    case 'setAPPEUI': return '0xFD' + payload; // 01FD0102030405060708
    case 'setABP': return '0x' + payload;      // 01FC0102030405060708090A0B0C0D0E0F10111213141516171819101A1B1C1D1E1F20212223
    case 'reset': return '0xEFFFFE';           // device flashes before rebooting
    case 'UTSensors': return '0x0A' + payload; // default sensor
  }
};

var makeManualApiCall = function (req, res, next) {
  
  console.log('params: ', res.locals);
  
  res.on('http timeout', function(data) {
    console.log('http timeout data: ', data);
  });
  
  // 
  if (res.locals.method) {
    var method = res.locals.method;
    // remove the method from the parameters before the rpc call
    delete res.locals.method;
    // console.log('params: ', req.locals);
    // console.log('method: ', method);  

    client.request(method, res.locals, function(err, response) {

      if (err) {
        console.log('Jayson RPC client error: ', err);
        // TODO make this via jayson which so far hasn't picked up'
        res.render('response', {"response": {"error": {"code": -32002, "message" : "device not found"}}});
      }

      if (response) {
        console.log(response);
        res.locals.response = response;
        next(renderResponse);
      }    
    });
    
    client.on('http timeout', function(err) {
      console.log(err);
    });
    
  } else { next(renderResponse); }
};

var saveRequestToFile = function (req, res, next) {
  
  // if there's no method field in the request we're saving the data to a file
  if (!res.locals.method) {
	  
    console.log("res.locals: ", JSON.stringify(res.locals));
	  
    if (res.locals.payload.length > 0) {
            
      // Encode the payload
      // var payloadstr = Buffer.from('reslocalspayload', 'hex');
      // var encryptedpayload = payloadstr.toString('base64');
      
      if ( validator.isHexadecimal(res.locals.payload) ) {

            var encryptedpayload = Buffer.from(res.locals.payload, 'hex').toString('base64');

            var packet = { "dev_eui" : res.locals.dev_eui,
                           "payload" : res.locals.payload,
                           "encrypted_payload": encryptedpayload };

            currentdevice = packet;

            var exportofile = fs.createWriteStream(path.join(__dirname, './../config/device.json'));
            exportofile.write(JSON.stringify(currentdevice));

            res.render('response', {'saved': 'Saved to file'});

        } else {
        
            var err = new Error('Not a valid hexadecimal payload.');
            err.status = 404;
            next(err);
      }
              
    } else { 
		
		next(renderResponse); 
	}
  } else { 
	  
	  next(renderResponse);   // else we're calling from the test form so move to the next middleware
  }
};

var renderResponse = function (res, req) {
  
  // console.log('rendering response: ', req.locals);
  if (req.locals.response) {
    
    req.render('response', {'response': req.locals.response});
	  
  } else {
    req.render('response', {'saved': 'Not saved, payload mandatory'});
  }
};

// Route for handling the forms
formRouter.post('*', getParams, saveRequestToFile, makeManualApiCall, /*retrievePacket,*/ renderResponse);

module.exports = formRouter;
