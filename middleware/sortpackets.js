const path  = require('path')
const mongoose = require('mongoose')
const { dumpHumanPayloads, dumpPackets, incrementDeviceCmdSeq, updateDeviceLastSeen } = require(path.join(__dirname,'./dbutils.js'))

/*
 * This middleware ends the JSON-RPC request cycle in the backend
 */

module.exports = (req, res, next) => {

  console.log('hit sortpackets()', req.body)

  // Add the method to the params for db dump
  let params = req.body.params

  req.body.params.method = req.body.method
  let method             = req.body.method

  try {

    switch (method) {

      case 'uplink':
        // Put uplinks human_payload in a separate collection
        dumpHumanPayloads(params.human_payload).then(() => {

          // Also add the full packets to the dump
          dumpPackets(params)

        }).then(() => {

          // Update the last time the device was seen, defaults to when the function is called if the payload doesn't contain any time info
          let time = params.rx_time || new Date()
          updateDeviceLastSeen(params.dev_eui, time)

          // Increment CmdAck value if the new command is accepted (i.e.if the new CmdAck is higher than what's in the db)
          if ( params.human_payload.MsgID === 'Alive' ) incrementDeviceCmdSeq(params.dev_eui, params.human_payload.CmdAck)

        }).catch(err => {

          console.log('Error saving uplink packet to db in sortpackets(): ', err)
          return res.end()
        })

        break
      // Everything else we just dump
      default: dumpPackets(params)
        break
    }

    return res.end()

  } catch (err) {

    console.log('Error in sortpackets(): ', err)

    return res.end()
  }
}
