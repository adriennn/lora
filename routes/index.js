const express   = require('express')
const router    = express.Router()
const path      = require('path')
const queue     = require(path.join(__dirname,'/../middleware/queue.js'))

// home page
router.get('/', (req, res, next) => {
  res.render('index', { title: 'Lora' })
})

// Display data from command queue
router.get('/:dev_eui', (req, res, next) => {

    console.log('req.params: ', req.params)

    try {

      let data = queue.get(req.params.dev_eui)

      res.locals.dev_eui           = data['dev_eui']
      res.locals.payload           = data['payload']
      res.locals.encrypted_payload = data['encrypted_payload']

      console.log('req.params.dev_eui: ', req.params.dev_eui)
      console.log('res.locals.dev_eui: ', res.locals.dev_eui)

      if ( req.params.dev_eui === res.locals.dev_eui ) {

          res.render('checkpayload', {
            title: 'Current command and data in queue',
            id: 'deveui',
            data: res.locals
          })
      }

    } catch (e) {
        let err = new Error(e.toString())
        err.status = 404
        res.render(err)
    }
})

module.exports = router
