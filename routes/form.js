var express = require('express'),
    formRouter = express.Router(),
    path = require('path'),
    fs = require('fs'),
    client = require(path.join(__dirname,'/../middleware/RPCclient.js'));

var currentdevice = JSON.parse(fs.readFileSync(path.join(__dirname, './../config/device.json'), 'utf8'));

/* param	    LoRaWAN name	value_type	necessity	description
*--------------------------------------------------------------------------------
* dev_eui	    DevEUI	        string	    required	Device unique ID
* dev_addr	    DevAddr	        string	    required	Device network address
* dev_nonce	    DevNonce	    string	    required	Random device nonce
* net_id	    NetID	        string	    required	Network unique ID
* cf_list	    CFList	        string	    optional	Channels frequencies list
*/

// RESPONSE
/* param	        LoRaWAN name	        value type	necessity	description
*-----------------------------------------------------------------------------------------------------------------
* nwkskey	        NwkSKey	                string	    required	Network session key
* accept_payload	join-accept message     string	    required	Join-Accept message (BASE64-encoded, encrypted)
*/

formRouter.get('/device', function(req, res, next) {
  res.render('device', {
    title: 'Add or register a device',
    id: 'device'
  });
});

formRouter.get('/listen', function(req, res, next) {
  res.render('listen', {
    title: 'Listen to RPC calls',
    id: 'listen'
  });
});

// RECEIVE / UPLINK
// core api sends uplink data sent by device to app server

/* param	            LoRaWAN name	value type	necessity	description
  *-----------------------------------------------------------------------------------------------------
  * dev_eui	            DevEUI	        string	    required	Device unique ID
  * dev_addr	            DevAddr	        string	    required	Device network address
  * rx_time	            -	            float	    required	UNIX timestamp of packet receive time
  * counter_up	        FCntUp (FCnt)	integer	    required	Uplink packets counter
  * port	                FPort	        integer	    required	Frame port
  * encrypted_payload     FRMPayload	    string	    required	Message (BASE64-encoded, encrypted)
  * payload	            -	            string	    optional	Message (BASE64-encoded, plain). This field is provided only in case of app_key was provided to the Network.
  * radio	                -  	            JSON object	optional	Radio receiving parameters. Provided parameters are from the "most quick" base station.

  * radio JSON object
  * name	        type	    necessity	description
  ***********************************************************************************************
  * gw_addr      string	    required	Gateway MAC-address
  * gw_gps       JSON object	required	Gateway GPS coordinates
  * server_time	integer	    required	UNIX timestamp of packet receive time on Core Server
  * gateway_time	integer	    required	UNIX timestamp of packet receive time on Gateway ('null' - if not available)
  * tmst	        integer	    optional	Internal timestamp of “RX finished” event, microseconds
  * freq	        float	    optional	RX central frequency in MHz
  * chan	        integer	    optional	Concentrator “IF” channel used for RX
  * rfch	        integer	    optional	Concentrator “RF chain” used for RX
  * stat	        integer	    optional	CRC status: 1 = OK, -1 = fail, 0 = no CRC
  * modu	        string	    optional	Modulation identifier “LORA” or “FSK”
  * datr	        string	    optional	Datarate identifier (eg. SF12BW125 for Lora)
  * codr	        string	    optional	ECC coding rate
  * rssi	        integer	    optional	RSSI in dBm
  * lsnr	        float	    optional	Lora SNR ratio in dB (0.1 dB precision)
  * size	        integer	    optional	RF packet payload size in bytes

  * gw_gps JSON object
  * name	type	description
  *-----------------------------------------------
  * lat	float	Latitude in degrees (-90;+90)
  * lon	float	Longitude in degrees (-180;+180)
  * alt	float	Altitude in meters
  */

formRouter.get('/send', function(req, res, next) {
  res.render('send', {
    title: 'Send data to a device',
    id: 'send'
  });
});

// Get the data in the express objects
var getParams = function(req, res, next) {
  // console.log('in get params');
  // process the form with a loop
  // console.log('form data: ', JSON.stringify(req.body));
  for (var key in req.body) {
     if (req.body.hasOwnProperty(key)) {
       res.locals[key] = req.body[key];
       console.log(res.locals[key]);
     }
  }
  next();      
};

var set1m2mCommandString = function(command, payload) {
  
  // TODO increment command counts for each dev_eui separately in ./config/device.json
    
  switch (command) {
    case 'reboot': return '0xFEFEFE';
    case 'setAPPEUI': return '0xFD' + payload; // 01FD0102030405060708
    case 'setABP': return '0x' + payload; // 01FC0102030405060708090A0B0C0D0E0F10111213141516171819101A1B1C1D1E1F20212223
    case 'reset': return '0xEFFFFE';
    case 'UTSensors': return '0x0A' + payload; // default sensor
  }
};

// incoming data from 1m2m

/*byte MsgID;       // Message Identification Value = 0x09
int16 VBat;       // Battery voltage in mV
int16 AnalogIn1;  // AnalogIn 1 in mV
int16 AnalogIn2;  // AnalogIn 2 in mV
int16 AnalogIn3;  // future use
int16 Analogin4;  // future use

TAnalogMsg;*/

// Make the call to JSON-RPC api
var makeManualApiCall = function(req, res, next) {
  
  console.log('params: ', res.locals);
  
  res.on('http timeout', function(data) {
    console.log('http timeout data: ', data);
  });
  
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
        next();
      }    
    });
    
    client.on('http timeout', function(err) {
      console.log(err);
    });
    
  } else { next(); }
};

var saveRequestToFile = function(req, res, next) {
  // if there's no method field in the request we're saving the data to a file
  // we could also look up the original request url
  if (!res.locals.method) {
  console.log("saveRequesttoFile data: ", JSON.stringify(res.locals));
    // build json params
    var packet = {
        "dev_eui" : res.locals.dev_eui,
        "payload" : res.locals.payload
    };

    if (packet.payload.length > 0) {
      
      // append to JSON 
      currentdevice[packet.dev_eui] = packet;
      
      var exportofile = fs.createWriteStream(path.join(__dirname, './../config/device.json'));
      exportofile.write(JSON.stringify(currentdevice));
      res.render('response', {'saved': 'Saved to file'});
    } else { next(); }
  }
  // else we're calling from the test form so move to the following middleware
  else { next(); }
};

var renderResponse = function(res, req) {
  // console.log('rendering response: ', req.locals);
  if (req.locals.response) {
    req.render('response', {'response': req.locals.response});
  } else {
    req.render('response', {'saved': 'Not saved, payload mandatory'});
  }
  
};

// Route for handling manual RPC call init from a form
formRouter.post('*', getParams, saveRequestToFile, makeManualApiCall, renderResponse);

module.exports = formRouter;
