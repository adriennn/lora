const mongoose = require('mongoose')
const Schema   = mongoose.Schema
const Device   = require('./device.js')

/*
 *
 * Human Payload schema for storing decrypted data from uplink packets
 * the human payload obj is decrypted using 1m2m.eu API
 */

const humanPayloadSchema = new Schema({
    data   : { type: String, required: true }
  , type   : { type: String, required: true } // GenSens, Alive, 1Wire, Analog ...
  , rxtime : { type: Date,   required: true, default: }
  , device : [ [{ type: Schema.Types.ObjectId, ref: 'Device' }] ]
})

const HumanPayload = mongoose.model('HumanPayload', humanPayloadSchema)

module.exports = HumanPayload


// Example:
//Gensens:

/**
"human_payload": {
  "MsgID": "GenSens",
  "BaromBar": "100982",
  "Temp": "25.15",
  "Humidity": "40",
  "LevelX": "0",
  "LevelY": "0",
  "LevelZ": "0",
  "VibAmp": "0",
  "VibFreq": "0"
}
**/

// Analog
/**
"human_payload": {
  "MsgID": "Analog",
  "Anin1": "240mV",
  "Anin2": "50mV",
}
**/

// Analog
/**
"human_payload": {
  "MsgID": "Analog",
  "Anin1": "240mV",
  "Anin2": "50mV",
}
**/

// Alive
/**
"human_payload": {
  "MsgID": "Alive",
  "SatInFix": "0",
  "Lat": "0.00000",
  "Lon": "0.00000",
  "Vdd": "100%",
  "Profile": "66",
  "CmdAck": "13",
  "Addr": ""
}

**/

// 1Wire
/**
"human_payload": {
  "MsgID": "1Wire",

}
**/
