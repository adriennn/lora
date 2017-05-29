var express = require('express'),
    mainRouter = express.Router(),
    path = require('path'),
    fs = require('fs');

var currentdevice = JSON.parse(fs.readFileSync(path.join(__dirname, './../config/device.json'), 'utf8'));

// home page
mainRouter.get('/', function(req, res, next) {
  res.render('index', { title: 'Lora' });
});

// Retrieve data from config file in config/device.json
mainRouter.get('/:dev_eui', function (req, res, next) {
  
  console.log('req.params: ', req.params);
  
  var id = req.params.dev_eui;
  
  res.locals.dev_eui = currentdevice['dev_eui'];
  res.locals.payload = currentdevice['payload'];
  res.locals.encrypted_payload = currentdevice['encrypted_payload'];
  
  console.log('id: ', id);
  console.log('res.locals.dev_eui',res.locals.dev_eui);
  
  if ( id === res.locals.dev_eui) {
    
    res.render('checkpayload', { title: 'Current configuration data',
                                 id: 'deveui',
                                 data: res.locals });
  } else {
    
      var err = new Error('Device not found.');
      err.status = 404;
      next(err);
  }
});

module.exports = mainRouter;
