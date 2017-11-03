const path  = require('path')
const mongoose = require('mongoose')
// const queue = require(path.join(__dirname,'./queue.js'))
const { dumpHumanPayloads, dumpPackets, incrementCmdAck, updateCmdAck } = require(path.join(__dirname,'./dbutils.js'))

module.exports = (req, res, next) => {

  console.log('hit sortpackets()', req.body)

  let params = req.body.params
  // Add the method to the params for db dump
  req.body.params.method = req.body.method
  let method  = req.body.method

  try {

    switch (method) {

      case 'uplink':
        // Put uplinks human_payload in a separate collection
        dumpHumanPayloads(params.human_payload).then(() => {

          // Also add the full packets to the dump
          dumpPackets(params)

        }).then(() => {

          // Update the last time the device was seen
          updateLastSeen(params.dev_eui, params.rx_time)

          // Increment CmdAck value if the new command is accepted (i.e.if the new CmdAck is higher than what's in the db)
          if ( params.human_payload.MsgID === 'Alive' ) incrementCmdAck(params.dev_eui, params.human_payload.CmdAck)

        }).catch(err => { console.log('Error saving uplink packet to db', err) })

        break
      // Everything else we just dump
      default: dumpPackets(params)
        break
    }

    // This end the request cycle so if we are
    return res.end()

  } catch (err) {

    console.log('Error in sortpackets(): ', err)

    return res.end()

  }

}
