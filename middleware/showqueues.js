const path  = require('path')
const queue = require(path.join(__dirname,'./queue.js'))

module.exports = (req, res, next) =>{

    console.log('hit showQueues', res.locals)

    // Pass req to the next middleware if it's not for the cache
    if (res.locals.resource !== 'queue') return next()

    try {

      queue.listQueues((err, queues) => {

        if ( err ){

          console.error( err )
          return next(err)
        }

        console.log('current queues', queues)

        res.locals.queues = queues

        return res.render('data', {
            resource : 'queue'
          , title    : 'All queues'
          , data     : res.locals.queues.length > 0 ? res.locals.queues : 'No queue'
        })

        })

    } catch (err) {

      return next(err)

    }
}
