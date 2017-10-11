const path    = require('path')
const fs      = require('fs')
const express = require('express')/* ??? */
const cache   = require(path.join(__dirname,'./cache.js'))
const utils   = require(path.join(__dirname,'./utils.js'))

/*
 * This middleware decrypts uplink packets with the 1m2m API to make them human-readable
 */
module.exports = (req, res, next) => {

    console.log('hit parsePackets()', req.body)

    // If it's an uplink we decode the payload
    if ( req.body.method === 'uplink' && req.body.params.payload ) {

        let decodepayload = utils.decode1m2mpayload(req.body.params.payload)

            decodepayload.then((obj) => {

              req.body.params.human_payload = obj

              // Set the polluton scale for the winsen ZP01-MP503 module if the 1m2m 'Analog' message data is present
              // TODO make this dynamic so we can set what sensors are on the Analog port
              if ( req.body.params.human_payload.MsgID == 'Analog' ) {

                  let anin1 = parseInt(req.body.params.human_payload.AnIn1, 10)
                  let anin2 = parseInt(req.body.params.human_payload.AnIn2, 10)

                  req.body.params.pollution_level = utils.getQualityIndex(anin1, anin2)
              }

              // Make the time readable
              let unixtime = req.body.params.rx_time || req.body.params.tx_time

              // TODO local time
              req.body.params.human_time = utils.convertTime(unixtime)

              // TODO
              // check if it's a TAlive / Alive message so we an extract the CmdAck param and save it to the db
              // so we can look up when creating new commands if the command sequence number matches the series
              // if (req.body.params.human_payload.MsgID == 'Alive') {
              //
              //     queue.set(req.body.params.dev_eui, {"cmd_ack" : red.body.params.human_payload.CmdAck} )
              // }

              console.log('Added decoded payload to req.body: ', req.body)

              return next()

        }).catch((err) => {

            return next(err)
        })

    // Else we pass the req to the next middleware
    } else {

        return next()
    }
};
