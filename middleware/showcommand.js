const path  = require('path')
const cache = require(path.join(__dirname,'./cache.js'))

module.exports = (req, res, next) => {

    console.log('hit showCommand', res.locals)

    if (res.locals.resource !== 'command') return next()

    try {

        let data = cache.get(res.locals.dev_eui)

        res.locals.payload           = data['payload']
        res.locals.encrypted_payload = data['encrypted_payload']
        delete res.locals.resource

    } catch (err) {

        console.log('hit error', err)

        return next(err)
    }

    return res.render('data', {
        resource : 'command'
      , title    : 'Current command in cache'
      , data     : res.locals
    })
}
