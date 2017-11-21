const path            = require('path')
const Device          = require('./../models/device')

module.exports = ( req, res, next ) => {

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

        // Remove keys we don't want to share with the user interface
        Object.keys(data).forEach((key) => {
          delete key.__v
          delete key._id
          delete key.added
        })

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
