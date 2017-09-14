const jayson  = require('jayson')
const path    = require('path')
const utils   = require(path.join(__dirname,'/../middleware/utils.js'))
const queue   = require(path.join(__dirname,'/../middleware/queue.js'))
const methods = {}

methods.everynet = {}

methods.everynet.uplink = jayson.Method( function (args, done) {

    utils.exportDataToFile('uplink', args)

    done(null, 'ok')
})

methods.everynet.downlink = jayson.Method( function (args, done) {

    try {

        let data = queue.get(args.dev_eui);

        console.log('data from command queue in downlink: ', data)

        if ( data.encrypted_payload && args.dev_eui == data.dev_eui ) {

            // TODO set pending to true if we have more commands in queue
            let result = {
                "pending": false,
                "confirmed": false,
                "payload": data.encrypted_payload
            }

            // TODO wait for Cmd_Ack in TAlive message before deleting
            queue.del(args.dev_eui)
            console.log('sending payload')
            done(null, result)
        }

    } catch (e) {

      console.log('Something went wrong in methods.everynet.downlink: ', e)
      done(null)
    }
})

methods.everynet.notify = (args, done) => {

    done(null, 'ok')
}

methods.everynet.join = (args, done) => {

    done(null, 'ok');
}

module.exports = methods
