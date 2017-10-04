const path      = require('path')
const rpcclient = require(path.join(__dirname,'./rpcclient.js'))

module.exports = (req, res, next) => {

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

            return req.render('response', {'error': err})
          }
        })

      } catch (err) {

        return req.render('response', {'error': err})
      }

      res.on('http timeout', (err) => {
        console.log('http timeout data: ', err)
      })

      rpcclient.on('http timeout', (err) => {
        console.log('http client timeout error: ', err)
      })

    } catch (e) {
      // res.render('response', {"response": {"error": {"code": 'missing method', "message" : e.toString()}}})
      let err = new Error(e.toString())
      err.status = 500
      res.render('response', {'response': err})
    }

}
