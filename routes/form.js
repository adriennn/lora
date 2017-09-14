require('dotenv').config()

const express    = require('express')
const formRouter = express.Router()
const path       = require('path')
const fs         = require('fs')
const utils      = require(path.join(__dirname,'/../middleware/utils.js'))
const rpcclient  = require(path.join(__dirname,'/../middleware/rpcclient.js'))
const queue      = require(path.join(__dirname,'/../middleware/queue.js'))

// var currentdevice = JSON.parse(fs.readFileSync(path.join(__dirname, './../config/device.json'), 'utf8'))

const getParams = (req, res, next) => {

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

const makeManualApiCall = (req, res, next) => {

  console.log('params from makeManualApiCall(): ', res.locals)

  if ( res.locals.method ) {

    var method = res.locals.method

    // Remove the method from the parameters before the rpc call
    delete res.locals.method
    console.log('method: ', method)

    rpcclient.request(method, res.locals, function (err, response) {

      if ( err ) {
        console.log('Jayson RPC client error: ', err)
        res.render('response', {"response": {"error": {"code": -32002, "message" : "device not found"}}})
      }

      if ( response ) {
        console.log(response)
        res.locals.response = response
        next()
      }
    })

    res.on('http timeout', function (data) {
      console.log('http timeout data: ', data)
    })

    rpcclient.on('http timeout', function(err) {
      console.log('http client timeout error: ', err)
    })
  }
}

const saveCommandToQueue = (req, res, next) => {

  // if there's no method field in the request we're saving the data to a file
  if ( !res.locals.method ) {

    console.log("res.locals from form.js saveCommandToQueue(): ", JSON.stringify(res.locals))

    if ( res.locals.command_str.length > 0 ) {

      let mergedpayload = res.locals.command_seq + res.locals.command_str + res.locals.command_val

      // TODO get user input in decimal and transform to hexadecimal including 0 padding if necessary
      console.log('Merged hexpayload: ', mergedpayload)

      try {

          let encryptedpayload = Buffer.from(mergedpayload, 'hex').toString('base64')

          let packet = {
            "dev_eui" : res.locals.dev_eui,
            "payload" : mergedpayload,
            "encrypted_payload": encryptedpayload
          }

          console.log('packet from saveCommandToQueue()', packet)

          queue.set(res.locals.dev_eui, packet)

          res.render('response', {'saved': 'Successfully saved to command queue.'})

      } catch (e) {res.render('response', {'saved': e.toString()})}

    } else {

        res.render('response', {'saved': 'Not saved, payload is mandatory.'})
	}

  } else {
	  // else we're calling from the test form so move to the next middleware
	  next()
  }
};

const renderResponse = (res, req) => {

  // console.log('rendering response: ', req.locals);
  if (req.locals.response) {

    req.render('response', {'response': req.locals.response})

  } else {
    req.render('response', {'saved': 'Not saved, payload is mandatory.'})
  }
}

formRouter.get('/test', (req, res, next) => {
  res.render('test', {
    title: 'Test RPC calls',
    id: 'test'
  })
})

formRouter.get('/listen', (req, res, next) => {

  var iosourceurl = process.env.IO_CONNECT

  console.log('io source: ', iosourceurl)

  res.render('listen', {
    title: 'Listen to RPC calls',
    id: 'listen',
    iosourceurl: iosourceurl
  })
})

formRouter.get('/records', (req, res, next) => {

    let data = JSON.parse(fs.readFileSync(path.join(__dirname, './../config/packets.json'), 'utf8'))

    // Parse the logfiles currently in storage for GenSens data
    let parsedata = utils.parseLog(data)

        parsedata.then( function ( obj ) {

          console.log('parsed obj: ', obj)

          res.locals.templog = JSON.stringify(obj)

          res.render('records', {
            title: 'Logged data',
            id: 'records',
            data: res.locals.templog
          })
      })
})

formRouter.get('/send', (req, res, next) => {
  res.render('send', {
    title: 'Send data to a device',
    id: 'send'
  })
})

formRouter.post('*', getParams, saveCommandToQueue, makeManualApiCall, renderResponse)

module.exports = formRouter
