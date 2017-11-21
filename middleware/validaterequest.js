const { validationResult } = require('express-validator/check');

module.exports = ( req, res,next ) => {

    console.log('Hit sanitizeReq()', req.body)

    try {

        const err = validationResult(req)

        // If there's an error return it to the view
        if ( !err.isEmpty() ) {

            // Return datacheck failure to error view
            if (process.env.NODE_ENV === 'production') {

              let error = new Error
              error.message = 'Form failed validation.'
              return next(error)
            }

            return next(JSON.stringify(err.mapped(), null, '\t'))
        }

        // Else if there's no validation error we can proceed with the next middleware
        return next()

    } catch (err) {

        return next(err)
    }

}
