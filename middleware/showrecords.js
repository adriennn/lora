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

    let data = JSON.parse(fs.readFileSync(path.join(__dirname, '/../config/packets.json'), 'utf8'))

    // TODO MongoDB lookup
    // use the dev_eui field and check if only one or several devices to check then parse and load data in view accordingly
    // also check recursively for data parameters and build graphs dynamically in the view

    // Parse the logfiles currently in storage for GenSens data
    let parsedata = utils.parseLog(data)

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
