const jayson  = require('jayson')
const path    = require('path')
const utils   = require(path.join(__dirname,'/../middleware/utils.js'))
const methods = {}
const queue   = require(path.join(__dirname,'/../middleware/queue.js'))

methods.everynet = {}

methods.everynet.uplink = jayson.Method( function (args, done) {

    utils.exportDataToFile('uplink', args)

    done(null, 'ok')
})

methods.everynet.downlink = jayson.Method( function (args, done) {

    // let currentdevice = JSON.parse(fs.readFileSync(path.join(__dirname, './../config/device.json'), 'utf8'))

    try {

        let data = queue.get(args.dev_eui);

        if ( data.encrypted_payload && args.dev_eui == data.dev_eui ) {

            let result = {
                "pending": false,
                "confirmed": false,
                "payload": data.encrypted_payload
            }

            // TODO emove the command after it was sent and  wait for Cmd_Ack message
            // utils.exportDataToFile('erase', {})
            queue.del(args.dev_eui)
            console.log('sending payload')
            done(null, result)
        }

    } catch (e) {

      console.log('Something went wrong while retrieving the command from the queue')
      done(null)
    }
})

methods.everynet.notify = (args, done) => {

    done(null, 'ok')
}

methods.everynet.join = () => {

    done(null, 'ok');
}

module.exports = methods
