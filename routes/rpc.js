/* Route for the RPC interface */
const express      = require('express')
const path         = require('path')
const fs           = require('fs')
const rpcRouter    = express.Router()
const parsePackets = require(path.join(__dirname,'/../middleware/parsepackets.js'))
const sortPackets  = require(path.join(__dirname,'/../middleware/sortpackets.js'))
const emitPackets  = require(path.join(__dirname,'/../middleware/emitpackets.js'))
const rpcServer    = require(path.join(__dirname,'/../middleware/rpcserver.js'))

// Handle the JSON-RPC 2.0 response for the lora network server
rpcRouter.use(rpcServer.middleware({end:false}))

/* Handle incoming packet data
 * parsePackets() converts payload to human readable data
 * emitPackets() sends the payload to any listening client websocket
 * sortPackets() handles database dumps
 */
rpcRouter.post('*', parsePackets, emitPackets, sortPackets)

module.exports = rpcRouter
