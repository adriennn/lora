const path    = require('path')
const fs      = require('fs')
const express = require('express')

const {decode1m2mpayload, getQualityIndex} = require(path.join(__dirname,'./utils.js'))

/*
 * This middleware prepares uplink payloads to make them human-readable
 */
module.exports = (req, res, next) => {

    console.log('hit parsePackets()', req.body)

    // If it's an uplink we decode the payload
    if ( req.body.method === 'uplink' && req.body.params.payload ) {

        let decodepayload = decode1m2mpayload(req.body.params.payload)

            decodepayload.then((obj) => {

              req.body.params.human_payload = obj

              // Set the polluton scale for the winsen ZP01-MP503 module if the 1m2m 'Analog' message data is present
              if ( req.body.params.human_payload.MsgID == 'Analog' ) {

                  let analog_input_1 = parseInt(req.body.params.human_payload.AnIn1, 10)
                  let analog_input_2 = parseInt(req.body.params.human_payload.AnIn2, 10)

                  req.body.params.human_payload.pollution_level = getQualityIndex(analog_input_1, analog_input_2)
              }

              // consolidate the dev_eui into the human_payload
              req.body.params.human_payload.dev_eui = req.body.params.dev_eui

              console.log('Added decoded payload to req.body: ', req.body)

              return next()

        }).catch((err) => {

            return next(err)
        })

    // Else if not an uplink we pass the req to the next middleware
    } else {

        return next()
    }
};
