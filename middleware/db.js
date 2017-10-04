const path           = require('path')
const mongoose       = require('mongoose')
const url            = 'mongodb://127.0.0.1:27017/lora'
// const uplinkSchema   = require(path.join(__dirname,'/../models/uplink.js'))
// const downlinkSchema = require(path.join(__dirname,'/../models/downlink.js'))

/*
 * In the mongoDB, the data is organized as following
 * each new device has a DEV_EUI (unique device identifier accroding to lorawan specification)
 * the DEV_EUI is used to create a new unique model in the db. Each model has as many schema as there are methods
 * used by the network server that supplies access to the lorawan, in our case: uplink, downlink, join, notify etc
 * see http://docs.everynet.com/platform-api/everynet-core-api-v.1.0/ for all the methods available
 */

mongoose.connect(url, { useMongoClient: true })

const dbUtils = {}

dbUtils.getAll = (s) => {

  let packetSchema = mongoose.model(s).schema

  // find() with an empty filter '{}' allows to get everything for a given db model
  return packetSchema.find({}).exec().then((data)=> {
      return data
    }).catch((err)=>{
      return next(err)
    })
}

// TO dump anything in the db
dbUtils.dumpData = (s, data) => {

    let model = mongoose.model(s)

        model.data = data

        model.save((err) => {

          if (err) console.log(err)

          console.log('dbManager.dumpData() OK', err)

        })
}

dbUtils.dumpUplink = (s, data) => {}

module.exports = dbUtils





// https://www.mongodb.com/blog/post/6-rules-of-thumb-for-mongodb-schema-design-part-1

// db.deveui.findOne()
// {
//     _id : ObjectID('DEV_EUI'),
//     name : 'myDevEui',
//     networkaddr : '0.0.0.0.0.0'
// }
//
// db.uplink.findOne()
// {
//     time : ISODate("2014-03-28T09:42:41.382Z"),
//     message : 'I am an uplink packet',
//     host: ObjectID('DEV_EUI')       // Reference to the Host document
// }