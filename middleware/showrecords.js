const path  = require('path')
const fs    = require('fs')
const utils = require(path.join(__dirname,'./utils.js'))

module.exports = (req, res, next) => {

    console.log('hit showrecords()', res.locals)

    if (res.locals.resource !== 'visual') {

      let err = new Error()
      err.status = 404
      err.message = 'Data request error'
      return next(err)
    }

    // TODO move this to utils.parselog() and do MongoDB lookup instead of file load
    let data = JSON.parse(fs.readFileSync(path.join(__dirname, '/../config/packets.json'), 'utf8'))

    let deveui

    // Get the device or devices to show data for
    if ( res.locals.dev_eui.indexOf(',') > -1 ) {

        console.log('multiple dev_eui')

        deveui = res.locals.dev_eui.split(',')

    } else {

      console.log('single dev_eui')

      deveui = []
      deveui.push(res.locals.dev_eui)

    }

    console.log('Parsed dev_eui field: ', deveui)

    // Parse the logfiles currently in storage for GenSens data
    let parsedata = utils.parseLog(data, deveui)

        parsedata.then((obj) => {

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
