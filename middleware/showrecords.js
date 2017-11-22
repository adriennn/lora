const path  = require('path')
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
    let getData = utils.extractData(deveui, type)

        getData.then((obj) => {

          // getData() returns an array of devices with the dev_eui as keys and for each key, there is a 'data_array' array
          // inside which the data for the sensors are grouped by type
          // eg. obj.devices.mydeveui.data_array[Temp]
          //     obj.devices.mydeveui.data_array[BaromBar]
          // ...

          res.locals.records = JSON.stringify(obj)

          // If we any of the below, they contain cooridinates and we display the data on a map
          if ( type === 'Alive' || 'Move' ) {

            return res.render('map', {
                title : 'Logged data'
              , id    : 'records'
              , data  :  res.locals.records
            })

          // Else we show the graph view
          } else {

            return res.render('records', {
                title : 'Logged data'
              , id    : 'records'
              , data  :  res.locals.records
            })

          }

      }).catch((err) => {

        return next(err)
      })
}
