const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Device = require('./device.js')

/*
 *
 * Alive schema for storing the command sequence number sent to each device
 * The CmdAck value is extracted from uplinks packets with the MsgId 'Alive'
 *
 */

const aliveSchema = new Schema({
    device     : [{ type: Schema.Types.ObjectId, ref: 'Device' }]
  , cmdack     :  { type: String, required: true, default: 0   }
})

const Alive = mongoose.model('Alive', aliveSchema)

module.exports = Alive
