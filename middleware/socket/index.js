const express = require('express')

/*
 * This middleware emits the received payloads to websockets
 */

module.exports = (req, res, next) => {

    console.log('hit websocket controller: ', req.body)

    try  {

        let io = req.app.get('socketio')

            // Add the RPC method to the payload so we pass only the payload to the view
            req.body.params.method = req.body.method

            io.emit("rpcrequest", req.body.params)

            return next()
    }

    catch (err) {

      return next(err)
    }
}
