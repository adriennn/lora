const { validationResult } = require('express-validator/check');

module.exports = ( req, res,next ) => {

    console.log('Hit sanitizeReq()')

    try {

        const err = validationResult(req)

        if (!err.isEmpty()) {

            // Return data check failure to error view
            return next(JSON.stringify(err.mapped(), null, '\t'))
        }

        return next()

    } catch (err) {

        return next(err)
    }

}
