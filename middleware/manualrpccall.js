const path      = require('path')
const rpcclient = require(path.join(__dirname,'./rpcclient.js'))

module.exports = (req, res, next) => {

    // If there's app_eui in the params we skip this middleware
    // TODO middleware routing in the route form
    if (res.locals.app_eui) {
      return next()
    }

    console.log('params from manualRpcCall(): ', res.locals)

    try {

      let method = res.locals.method

      // Remove the method from the parameters before the manual rpc call
      delete res.locals.method

      // Pass the form datam wich are in res.locals, to the RPC client
      try {

        rpcclient.request(method, res.locals, (err, response) => {

          try {

            res.locals.response = response

            return res.render('response', {'response': res.locals.response})

          } catch (err) {

            console.log(err)

            return next(err)
          }
        })

      } catch (err) {

        return next(err)
      }

      res.on('http timeout', (err) => {
        console.log('http timeout data: ', err)
      })

      rpcclient.on('http timeout', (err) => {
        console.log('rpc client timeout error: ', err)
      })

    } catch (e) {
      let err = new Error()
      err.status = 500
      err.message = e
      return next(err)
    }

}
