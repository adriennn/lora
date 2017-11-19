const path  = require('path')
const queue = require(path.join(__dirname,'./queue.js'))

module.exports = (req, res, next) => {

  // if there's no method field in the request we're saving the form data to the command queue
  if ( !res.locals.method ) {

    // If there's app_eui in the params we skip this middleware
    // TODO middleware routing in the form router
    if (res.locals.app_eui) {
      return next()
    }

    console.log("res.locals from form.js saveCommandToCache(): ", JSON.stringify(res.locals))

    if ( res.locals.command_str.length > 0 ) {

      let mergedpayload = res.locals.command_seq + res.locals.command_str + res.locals.command_val

      // Remove 0x
      mergedpayload = mergedpayload.replace(/0x/gi, "")

      console.log('Merged hexpayload: ', mergedpayload)

      try {

          let encryptedpayload = Buffer.from(mergedpayload, 'hex').toString('base64')

          let packet = {
              "dev_eui"           : res.locals.dev_eui
            , "payload"           : mergedpayload
            , "encrypted_payload" : encryptedpayload
            , "pending"           : res.locals.command_pending
          }

          console.log('packet from saveCommandToCache()', packet)

          let queuename = res.locals.dev_eui

          // FIXME this is a horrible promise nightmare but it seems rsmq is like that
          // Check if queue exists
          queue.listQueues().then(queues => {

            console.log('Queue list: ', queues)

            // Create a queue to storecommand for the device if it doesn't exist
            if ( !queues || queues.indexOf(queuename) < 0 ) {

              return queue.createQueue({qname:queuename}).then((resp) => {

                if ( resp===1 ) {

                  console.log(`queue ${queuename} created`)

                  // Submit the new packet to be sent to the queue, the methods.downlink() will then read that queue
                  return queue.sendMessage({qname:queuename, message: JSON.stringify(packet)}).then((resp) => {

                    if ( resp ) {

                      console.log(`"Message with id ${resp} sent to queue.`)

                      return res.render('response', {
                          saved : `Successfully saved message with id ${resp} to command queue ${queuename}.`
                      })
                    }
                  }).catch((err) => {
                    console.log(`Error sending message to queue ${queuename}`)
                    return next(err)
                  })
                }
              }).catch((err) => {
                console.log('Error creating new queue')
                return next(err)
              })
            } else {

              return queue.sendMessage({qname:queuename, message: JSON.stringify(packet)}).then((resp) => {

                if ( resp ) {

                  console.log(`"Message with id ${resp} sent to queue:`)

                  return res.render('response', {
                      saved : `Successfully saved message with id ${resp} to command queue ${queuename}.`
                  })
                }
              }).catch((err) => {
                console.log(`Error sending message to queue ${queuename}`)
                return next(err)
              })
            }

          }).catch((err) => {

            console.log('Error listing queues')

            queuelist = null
          })

      } catch (err) {

        return next(err)
      }

    } else {

        let err = new Error
        err.status = 500
        err.message = 'All fields mandatory'

        return next(err)
	}

  } else {
	  // else we're calling from the rpc test form so we move to the next middleware
	  return next()
  }
}
