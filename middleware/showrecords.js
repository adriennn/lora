const path  = require('path')
const fs    = require('fs')
const utils = require(path.join(__dirname,'./utils.js'))

module.exports = (req, res, next) => {

    console.log('hit showrecords()', res.locals)

    if (res.locals.resource !== 'visual') {

      // This is the last data middleware
      let err = new Error()
      err.status = 404
      err.message = 'Data request error'
      return next(err)
    }

    // TODO move this to utils.extractData() middleware and do MongoDB lookup instead of file load
    let data = JSON.parse(fs.readFileSync(path.join(__dirname, '/../config/packets.json'), 'utf8'))
    let type = res.locals.type
    let deveui

    if ( !res.locals.dev_eui ) {

      let err = new Error()
      err.status = 403
      err.message = 'DEV_EUI required'
      return next(err)
    }

    // Get the device or devices DEV_EUI
    if ( res.locals.dev_eui.indexOf(',') > -1 ) {

        console.log('multiple dev_eui')

        deveui = res.locals.dev_eui.split(',')

    } else {

      console.log('single dev_eui')

      deveui = []
      deveui.push(res.locals.dev_eui)

    }

    console.log('Parsed dev_eui field: ', deveui)

    // Parse the logfiles currently in storage
    // TODO pass thrid parameter with type of data wanted for visualization, e.g GenSens, Analog, 1Wire etc
    let getData = utils.extractData(data, deveui, type)

        getData.then((obj) => {

          res.locals.records = JSON.stringify(obj)

          return res.render('records', {
              title : 'Logged data'
            , id    : 'records'
            , data  :  res.locals.records
          })

      }).catch((err) => {

        return next(err)
      })

}
