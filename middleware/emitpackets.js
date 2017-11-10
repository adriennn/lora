const express = require('express')

/*
 * This middleware emits the packet to websockets
 */
module.exports = (req, res, next) => {

    console.log('hit emitPackets()', req.body)

    try  {

        let io = req.app.get('socketio')

            // Add the method to the payload so we pass only the payload to the view
            req.body.params.method = req.body.method

            io.emit("rpcrequest", req.body.params)

            return next()
    }

    catch (err) {

      return next(err)
    }
}
