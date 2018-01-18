const express     = require('express')
const router      = express.Router()
const path        = require('path')
const getParams   = require(path.join(__dirname,'/../middleware/getparams.js'))
const showCache   = require(path.join(__dirname,'/../middleware/showcache.js'))
const showDb      = require(path.join(__dirname,'/../middleware/showdb.js'))
const showCommand = require(path.join(__dirname,'/../middleware/showcommand.js'))
const showRecords = require(path.join(__dirname,'/../middleware/showrecords.js'))
const showQueues  = require(path.join(__dirname,'/../middleware/showqueues.js'))

/*
 * Form router to show databases, queues, devices etc...
  * use .param() to validate deveuis router-wide
  * @param [String] id - the actual value of the 'deveui' parameter
  */
router.param('deveui', (req, res, next, id) => {

 Devices.find(id, (err, device) => {

   if (err) {
     next(err)

   } else if (device) {

     req.device = device;
     next()

   } else {

     next(new Error('Cannot find device'))
   }
 })
})

router.post('/', getParams, showDb, showCache, showCommand, showQueues, showRecords)

/*
 * TODO
 * Routes for reading db, cache, queue, command and records for a given device
 * @param 'deveui' - the device unique id
 * @param 'type'   - the type of packet to extract (analog, 1wire,  )
 * @param 'time'   - the time and dates for which data is sought format DDMMYY:HHMMSS-DDMMYY:HHMMSS (start - end)
 */

// router.get('/db/:deveui/:type/:time', getParams, showDb)
// router.get('/cache/:deveui', getParams, showCache)
// router.get('/cmd/:deveui', getParams, showCommand)
// router.get('/q/:deveui', getParams, showQueues)
// router.get('/r/:deveui/:type/:time', getParams, showRecords)

// TODO add a 'renderdata' view that is called at the end instead of rendering in each middleware above

router.get('/', (req, res, next) => {
  res.render('show', { // use 'data' but change the other 'data' view to something more meaningful
      title: 'Retrieve data about a resource'
    , id: 'show' // 'data'
  })
})

module.exports = router
