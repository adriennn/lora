const mongoose = require('mongoose')
const Schema   = mongoose.Schema
const Device   = require('./device.js')

/*
 *
 * Uplink schema for storing raw data from all uplink packets
 *
 */

const uplinkSchema = new Schema({
    data   : { type: String, required: true }
  , type   : { type: String, required: true }
  , rxtime : { type: Date,   required: true }
  , device : [ [{ type: Schema.Types.ObjectId, ref: 'Device' }] ]
})

const Uplink = mongoose.model('Uplink', uplinkSchema)

module.exports = Uplink
