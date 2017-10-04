const path  = require('path')
const cache = require(path.join(__dirname,'./cache.js'))

module.exports = (req, res, next) => {

  // if there's no method field in the request we're saving the form data to the command queue
  if ( !res.locals.method ) {

    console.log("res.locals from form.js saveCommandToCache(): ", JSON.stringify(res.locals))

    if ( res.locals.command_str.length > 0 ) {

      let mergedpayload = res.locals.command_seq + res.locals.command_str + res.locals.command_val

      // TODO get user input in decimal and transform to hexadecimal including 0 padding if necessary
      console.log('Merged hexpayload: ', mergedpayload)

      try {

          let encryptedpayload = Buffer.from(mergedpayload, 'hex').toString('base64')

          let packet = {
              "dev_eui"           : res.locals.dev_eui
            , "payload"           : mergedpayload
            , "encrypted_payload" : encryptedpayload
          }

          console.log('packet from saveCommandToCache()', packet)

          cache.set(res.locals.dev_eui, packet)

          return res.render('response', {
              saved : 'Successfully saved to command queue.'
            , url   : '/lora/' + res.locals.dev_eui
          })

      } catch (e) {

        return res.render('response', {'saved': e.toString()})
      }

    } else {

        return res.render('response', {'saved': 'Not saved, payload is mandatory.'})
	}

  } else {
	  // else we're calling from the rpc test form so we move to the next middleware
	  return next()
  }
}
