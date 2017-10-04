/* Route for the RPC interface */
const express      = require('express')
const path         = require('path')
const fs           = require('fs')
const rpcRouter    = express.Router()
const parsePackets = require(path.join(__dirname,'/../middleware/parsepackets.js'))
const sortPackets  = require(path.join(__dirname,'/../middleware/sortpackets.js'))
const emitPackets   = require(path.join(__dirname,'/../middleware/emitpackets.js'))
const rpcServer    = require(path.join(__dirname,'/../middleware/rpcserver.js'))

rpcRouter.use(rpcServer.middleware({end:false}))
rpcRouter.post('*', parsePackets, emitPackets, sortPackets)

module.exports = rpcRouter
