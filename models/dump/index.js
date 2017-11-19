const mongoose = require('mongoose')
const Schema   = mongoose.Schema

/*
 *
 * Dump for storing full packets
 * @params data - stringified packet
 * @params method - one of [ 'uplink', 'downlink', 'join', 'notify', ... ]
 * @params date - db timestamp
 *
 */

const dumpSchema = new Schema({
    data   : { type: Schema.Types.Mixed, required: true }
  , method : { type: String, required: true     }
  , date   : { type: Date  , default : new Date }
})

const Dump = mongoose.model('Dump', dumpSchema, 'Dump')

module.exports = Dump
