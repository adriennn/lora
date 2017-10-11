const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Alive = require('./alive.js')

const deviceSchema = new Schema({
    devaddress : { type: String, required: true, unique: true }
  , deveui     : { type: String, required: true, unique: true }
  , appeui     : { type: String, required: true               }
  , created_at : { type: Date  , default: Date.now            }
  , active     :         Boolean
  , cmdack     : [{ type: Schema.Types.ObjectId, ref: 'Alive' }]
})

const Device = mongoose.model('Device', deviceSchema)

module.exports = Device
