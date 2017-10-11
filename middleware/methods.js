const path    = require('path')
const jayson  = require('jayson')
const cache   = require(path.join(__dirname,'./cache.js'))
const utils   = require(path.join(__dirname,'./utils.js'))
const methods = {}

methods.everynet = {}

methods.everynet.uplink = jayson.Method( function (args, done) {

    // TODO save to db

    utils.exportDataToFile(args)

    console.log('hit methods.everynet.uplink')
    done(null, 'ok')
})

methods.everynet.downlink = jayson.Method( function (args, done) {

    console.log('hit methods.everynet.downlink')
    try {

        let data = cache.get(args.dev_eui, true)

        console.log('Data from command cache in downlink method: ', data)

        if ( data.encrypted_payload && args.dev_eui == data.dev_eui ) {

            // Convert pending status to boolean
            data.pending === 'true' ? data.pending = true : data.pending = false

            let result = {
                  "pending"   : data.pending
                , "confirmed" : false // we do not need delivery confirmation to device because we can read CmdAck
                , "payload"   : data.encrypted_payload
            }

            // TODO wait for Cmd_Ack in TAlive message before deleting
            cache.del(args.dev_eui)

            console.log('sending payload', result)

            done(null, result)
        }

    } catch (err) {

      console.log('Error in methods.everynet.downlink: ', err.message)
      done(null, 'null')
    }
})

methods.everynet.notify = (args, done) => {
    console.log('hit methods.everynet.notify')
    done(null, 'ok')
}

methods.everynet.join = (args, done) => {
    console.log('hit methods.everynet.join')
    done(null, 'ok')
}

module.exports = methods
