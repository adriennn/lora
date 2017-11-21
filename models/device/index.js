const mongoose = require('mongoose')
const Schema = mongoose.Schema

/*
 *
 * Schema for devices
 * @params devaddress - current address in the network
 * @params deveui - fixed device unique identifier
 * @params appeui - application unique id
 * @params added - first time the device was seen
 * @params cmdack - current command sequence index for device
 * @params active - the device has been emiting in the last day
 * @params vdd - current battery power in %
 *
 */

const deviceSchema = new Schema({
    devaddress : { type: String ,                 unique: true }
  , deveui     : { type: String , required: true, unique: true }
  , appeui     : { type: String , required: true               }
  , cmdack     : { type: Number , default : 1                  }
  , vdd        : { type: String , default : 0                  }
  , added      : { type: Date   , default : new Date           }
  , lastseen   : { type: Date   , default : new Date           }
  , active     : { type: Boolean, default : false              }
  , owner      : { type: String ,                unique  : true}
  , latlng     : { type: String }
})

const Device = mongoose.model('Device', deviceSchema, 'Device')

deviceSchema.statics.updateCmdAck = function (dev, newVal) {

  // Update if the value in storage is lower than 'newVal'
  this.findOneAndUpdate({ deveui: dev }, { $max: { cmdack: newVal }}, {new: true}, (err, data) => { return err} )
}

deviceSchema.statics.updateLastSeen = function (dev, t) {

  console.log('device last seen method', dev)

  // Update if the value in storage is lower than t
  this.findOneAndUpdate({ deveui: dev }, { $max: { lastseen: t }}, {new: true}, (err, data) => { return err} )
}

deviceSchema.statics.setActive = function (dev, isactive) {

   this.findOneAndUpdate({deveui: dev}, {active: isactive}, {new: true}, (err, data) => { return err})
}

module.exports = Device
