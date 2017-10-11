const mongoose = require('mongoose')
const Schema   = mongoose.Schema
const Device   = require('./device.js')

const downlinkSchema = new Schema({
    data   : { type: String, required: true }
  , type   : { type: String, required: true }
  , rxtime : { type: Date,   required: true }
  , device : [ [{ type: Schema.Types.ObjectId, ref: 'Device' }] ]
})

const Dowlink = mongoose.model('Uplink', dwnlinkSchema)

module.exports = Dowlink
