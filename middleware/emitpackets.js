const express = require('express')

/*
 * This middleware emits the packet to websockets
 */
module.exports = (req, res, next) => {

    console.log('hit parsePackets()', req.body)

    try  {

        let io = req.app.get('socketio')

            io.emit("rpcrequest", req.body)

            return next()
    }

    catch (err) {

      return next(err)
    }
}
