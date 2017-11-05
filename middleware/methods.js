const path    = require('path')
const jayson  = require('jayson')
const queue   = require(path.join(__dirname,'./queue.js'))
// const cache   = require(path.join(__dirname,'./cache.js'))
const utils   = require(path.join(__dirname,'./utils.js'))
const dbutils = require(path.join(__dirname,'./dbutils.js'))

exports.everynet = {}

exports.everynet.uplink = jayson.Method( function (args, done) {

    // Here we don't care about sincronicity, done() can fire while the data is still being written
    // Remove this once the db dump is functional
    utils.exportDataToFile(args)

    console.log('hit methods.everynet.uplink')
    done(null, 'ok')
})

exports.everynet.downlink = jayson.Method( async function (args, done) {

    console.log('hit methods.everynet.downlink')

    // Get the next message from the device queue with a promise
    let data = await queue.popMessage({qname:args.dev_eui})

    console.log("Data in queue message: ", data)

    let result = {
          "pending"   : data.pending
        , "confirmed" : false
        , "payload"   : data.encrypted_payload
    }

    console.log('sending payload', result)

    return done(null, result)

})

exports.everynet.notify = (args, done) => {
    console.log('hit methods.everynet.notify')
    done(null, 'ok')
}

exports.everynet.join = (args, done) => {
    console.log('hit methods.everynet.join')
    done(null, 'ok')
}
