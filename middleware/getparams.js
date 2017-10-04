/*
 * Save the form data in the res.locals key so we can pass them around
 */
module.exports = (req, res, next) => {

    console.log('hit getparams()', req.body)

    for ( let key in req.body ) {

       if (req.body.hasOwnProperty(key)) {

         res.locals[key] = req.body[key]
       }
    }

    next()
}
