const path            = require('path')
const Device          = require('./../models/device.js')
const { listDevices } = require(path.join(__dirname,'/../middleware/dbutils.js'))

module.exports = ( req, res,next ) => {

    console.log('hit addNewDevice')

    let device = new Device ({
      deveui     : req.body.dev_eui
    , appeui     : req.body.app_eui
    , cmdack     : req.body.cmd_ack
    , added      : Date.now()
    , lastseen   : Date.now()
    })

    device.save().then((err, data) => {

      console.log('New dev', data )

      console.log('Dev list', req.params.devicelist)

      res.locals.devicelist = req.params.devicelist

      res.locals.devicelist['newdev'] = device

      res.render('device', {
          title: 'Manage devices'
        , id: 'device'
        , data: res.locals.devicelist
      })
    })
}
