var express = require('express'),
    formRouter = express.Router(),
    path = require('path'),
    clientRPC = require(path.join(__dirname,'/../middleware/RPCclient.js'));

// ADD NEW DEVICE
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
    title: 'Listen to data from a given device',
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

// incoming data from everynet
/*var json = {
  "params": {
    "dev_eui": "d7549c622c909b6b",
    "dev_addr": "179de157",
    "tx_time": 1488446487.259191,
    "max_size": 242,
    "counter_down": 0
  },
  "jsonrpc": "2.0",
  "id": "72655e7a7eed",
  "method": "downlink"
}*/

formRouter.get('/receive', function(req, res, next) {
  res.render('receive' /*, {key: value}*/);
});

formRouter.get('/send', function(req, res, next) {
  res.render('send', {
    title: 'Send a request to a device',
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

// Make the call to JSON-RPC api
var makeApiCall = function(res, req, next) {
    
  // console.log('params: ', req.locals);
  var method = req.locals.method;
  // remove the method from the parameters before the rpc call
  delete req.locals.method;
  // console.log('params: ', req.locals);
  // console.log('method: ', method);  
  
  clientRPC.request(method, req.locals, function(err, response) {
    
    if (err) {
      console.log('Jayson RPC client error: ', err);
    }
        
    if (response) {
      console.log(response);
      req.locals.rpcresponse = response;
      
      next();
    }    
  });
};

var renderResponse = function(res, req) {
  req.render('response', {'response': req.locals.rpcresponse});
};

// Route for handling manual RPC call init from a form
formRouter.post('*', getParams, makeApiCall, renderResponse);

module.exports = formRouter;
