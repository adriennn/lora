const mongoose = require('mongoose')
const Schema   = mongoose.Schema
const Device   = require('./../device')

/*
 *
 * Denormalized Human Payload schema for storing decrypted data from uplink packets
 * the human payload obj is decrypted using 1m2m.eu API
 * @params data - stringified
 * @params type is one of [ 'GenSens', 'Alive', '1WireT', 'Analog', 'DailyRep', 'MoveStart', 'Reboot' ... ]
 * @params
 * @params
 *
 */

const humanPayloadSchema = new Schema({
    data   :  { type: Schema.Types.Mixed, required: true        }
  , type   :  { type: String, required: true                    }
  , time   :  { type: Date  , required: true, default: new Date }
  , device :  { type: String, required: true                    }
})

humanPayloadSchema.statics.getMany = function (dev, n) {

  let amount = n.parseInt(10)

  let data = []

  Object.keys(devices).forEach((dev) => {
      data[dev] = this.find({device: dev}).sort({time : -1}).limit(amount).toArray().catch((err) => { return err })
  })

  return data
}

humanPayloadSchema.path('data').required(true, 'Payload data cannot be empty')

const HumanPayload = mongoose.model('HumanPayload', humanPayloadSchema, 'HumanPayload')

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
human_payload:
 { MsgID: '1WireT',
   OWID1: '0',
   OWTemp1: '22.30',
   OWID2: '0',
   OWTemp2: '22.30',
   OWID3: '0',
   OWTemp3: '22.30',
   OWID4: '0',
   OWTemp4: '22.60',
   OWID5: '',
   OWTemp5: '22.00' }
**/
