const path            = require('path')
const Device          = require('./../models/device.js')
const { listDevices } = require(path.join(__dirname,'/../middleware/dbutils.js'))
const db              = require(path.join(__dirname,'/../middleware/dbutils.js'))

module.exports = ( req, res,next ) => {

    console.log('hit addNewDevice')

    let device = new Device ({
        deveui     : req.body.dev_eui
      , appeui     : req.body.app_eui
      , cmdack     : req.body.cmd_ack
      , added      : Date.now()
      , lastseen   : Date.now()
    })

    device.save().then((data) => {

      console.log('New dev: ', data)

      Device.find().lean().exec().then((data) => {

        res.locals.devicelist = data

        res.render('device', {
            title: 'Manage devices'
          , id: 'device'
          , data: res.locals.devicelist
        })

      }).catch((err) => {

        console.log('Err in addNewDevice: ', err)

        return next(err)
      })

    }).catch((err) => {

      next(err)
    })
}
