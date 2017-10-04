const path  = require('path')
const cache = require(path.join(__dirname,'./cache.js'))

module.exports = (req, res, next) =>{

    console.log('hit showCache', res.locals)

    // Pass req to the next middleware if it's not for the cache
    if (res.locals.resource !== 'cache') return next()

    // TODO need a promise for the below because async
    try {

        let allkeys = cache.keys()

        res.locals.allkeys = cache.mget(allkeys)

    } catch (err) {

      return next(err)

    }

    return res.render('data', {
        resource : 'cache'
      , title    : 'All commands in cache'
      , data     : Object.keys(res.locals.allkeys).length > 0 ? res.locals.allkeys : 'Cache is empty'
    })
}
