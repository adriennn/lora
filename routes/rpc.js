/* Route for the RPC interface */
const express   = require('express')
const path      = require('path')
const fs        = require('fs')
const RPCrouter = express.Router()
const jayson    = require('jayson')
const utils     = require(path.join(__dirname,'/../middleware/utils.js'))
const methods   = require(path.join(__dirname,'/../middleware/methods.js'))
const queue     = require(path.join(__dirname,'/../middleware/queue.js'))

const catchRpc = (req, res, next) => {

    let io = req.app.get('socketio')

    // console.log('req value from RPCRouter.post(*): ', req.body)

    // Decode the 1m2m payload before sending it to the listen.pug view
    if ( req.body.params.payload ) {

        let decodepayload = utils.decode1m2mpayload(req.body.params.payload)

            decodepayload.then( function (obj) {

              req.body.params.human_payload = obj

              // set the polluton scale for the winsen ZP01-MP503 module if the analog data is present
              if ( req.body.params.human_payload.MsgID == 'Analog' ) {

                  req.body.params.pollution_level = utils.getQualityIndex(parseInt(req.body.params.human_payload.AnIn1, 10), parseInt(req.body.params.human_payload.AnIn2, 10))
              }

              // Make the time readable
              let unixtime = req.body.params.rx_time ? req.body.params.rx_time : req.body.params.tx_time

                  req.body.params.human_time = utils.convertTime(unixtime)

              // check if it's a TAlive message so we an extract the CmdAck param and save it to the cache
              // TODO save to DB
              if (req.body.params.human_payload.MsgID == 'Alive') {

              //    utils.exportDataToFile('cmdack', { "dev_eui" : req.body.params.dev_eui, "cmd_ack" : red.body.params.human_payload.CmdAck });
                    queue.set(req.body.params.dev_eui, {"cmd_ack" : red.body.params.human_payload.CmdAck} );
              }

              console.log('Added decoded payload to req.body: ', req.body)

              io.emit("rpcrequest", req.body)

              next()
        })

    } else {

        io.emit("rpcrequest", req.body)

        next()
    }
};

// Any request coming to /lora/rpc will be handled by the jayson server
var jaysonserver = jayson.server(methods.everynet, {params: Object})

RPCrouter.post('*', catchRpc, jaysonserver.middleware())

module.exports = RPCrouter
