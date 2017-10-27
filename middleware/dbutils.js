require('dotenv').config()

const path      = require('path')
const mongoose  = require('mongoose')
const mongo_url = process.env.MONGO_CONNECT
const db        = mongoose.connect(mongo_url, { useMongoClient: true })

// Set native nodejs promises for mongoose
mongoose.Promise = Promise

db.on('error', (err) => { console.log('connection error:', err) })
db.once('open', ()   => { console.log('connected to MongoDB')   })

exports.listDevices = (req, res, next) => {

  console.log('hit listDevices')

  const Devices = require('./../models/device.js')

  return Devices.find().exec().then((data) => {

    res.locals.devicelist = data

    next()

  }).catch((err) => {

    console.log('Err in listDevices: ', err)

    next(err)
  })

}

exports.getPayloads = (dev, n) => {

  console.log('hit getPayloads')

  const Payloads = require('./../models/humanpayload.js')

  // Use the schema own static
  return Payloads.getMany(dev, n).exec().then((data) => {

    return data

  }).catch((err) => {

    console.log('Err in getPayloads: ', err)
  })

}

exports.dumpHumanPayloads = (data) => {

  return new Promise ( function (resolve, reject) {

    console.log('hit dumpHumanPayloads')

    const Hpm = require('./../models/humanpayload.js')

    let hpm = new Hpm ({
        data   : JSON.stringify(data)
      , time   : new Date
      , type   : data.MsgId
      , device : data.dev_eui
    })

    hpm.save().catch((err) => {

      console.log(`Error in dbUtils.dumpData() for packet ${data.method}: `, err)
      reject(err)

    }).then(() => {

      console.log(`Dumped data for packet ${data.method}: `, data)
      // Just resolve as true so we know it's ok
      resolve(true)
    })
  })
}

exports.dumpPackets = (data) => {

  return new Promise ( function (resolve, reject) {

    console.log('hit dumpPackets')

    console.log('data in dumpPackets', data)

    const Dump = require('./../models/dump.js')

    let dump = new Dump ({
        data   : JSON.stringify(data)
      , time   : new Date
      , method : data.method
      , device : data.dev_eui
    })

    dump.save().catch((err) => {

      console.log(`Error in dbUtils.dumpData() for packet ${data.method}: `, err)

      reject(err)

    }).then(() => {

      console.log(`Dumped data for packet ${data.method}: `, data)
      resolve(true)
    })
  })
}

exports.incrementCmdAck = (dev, curr) => {

  const Device = require('./../models/device.js')

  // Use the schema own method
  Device.updateCmdAck(dev, curr)
}

exports.updateLastSeen = (dev, t) => {

  const Device = require('./../models/device.js')

  // Use the schema own method
  Device.updateLastSeen(dev, t)
}


/*
Time series schema, reference data per device per hour per sensor
{
    "_id"   : deviceId,
    "start" : startDay,
    "type"  : "Analog",
    "AnIn1" : {
        "hours" : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    },
    "AnIn2" : {
        "hours" : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    }
}
*/
