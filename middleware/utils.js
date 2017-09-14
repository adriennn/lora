const path = require('path')
const fs   = require('fs')
const http = require('http')
const utils = {}

utils.exportDataToFile = (ref, data) => {

      switch ( ref ) {

        case 'uplink' :

            let packetsdatabase = JSON.parse(fs.readFileSync(path.join(__dirname, './../config/packets.json'), 'utf8'))
                packetsdatabase.push(data)

            fs.writeFileSync(path.join(__dirname, './../config/packets.json'), JSON.stringify(packetsdatabase))
            break

        case 'cmdack' :

            let commandqueue = JSON.parse(fs.readFileSync(path.join(__dirname, './../config/command_queue.json'), 'utf8'))
                commandqueue[data.dev_eui] = data.cmd_ack

            fs.writeFileSync(path.join(__dirname, './../config/packets.json'), JSON.stringify(commandqueue))
            break

        // case 'erase' :
        //
        //     fs.writeFileSync(path.join(__dirname, './../config/device.json'), JSON.stringify({}))
        //     break
      }
}

utils.decode1m2mpayload = (obj) => {

  return new Promise ( function (resolve, reject) {

      console.log('1m2m payload to make human readable: ', obj)

      var hex_o =  Buffer.from(obj.toString(), 'base64').toString('hex')
      var url = 'http://1m2m.eu/services/GETPAYLOAD?Human=0&PL=' + hex_o

      http.get(url, function (res) {

          const { statusCode } = res
          const contentType = res.headers['content-type']

          let error

          if (statusCode !== 200) {

              error = new Error('Request Failed.\n' +
                              `  Status Code: ${statusCode}`)
          }

          if (error) {

              console.error(error.message)
              res.resume()
              return
          }

          let rawData = ''

          res.on('data', function (chunk) { rawData += chunk })

          res.on('end', function () {

            try {
                const parsedData = JSON.parse(rawData)
                console.log('Parsed response data', parsedData.toString())
                resolve( parsedData )

            } catch (e) {
                console.error(e.message)
            }
          })

      }).on('error', (e) => {
        console.error(`Got error: ${e.message}`)
      })
  })

}

utils.getQualityIndex = (AnIn1, AnIn2) => {

    return
    AnIn1 < 250  && AnIn2 < 250  ? 'clean'  :
    AnIn1 < 250  && AnIn2 > 3000 ? 'light'  :
    AnIn1 > 3000 && AnIn2 < 250  ? 'medium' :
                                   'high'
}

utils.convertTime = (s) => {
    return new Date(s * 1e3).toISOString().slice(-13, -5)
}

utils.parseLog = (data) => {

      // TODO make this more dynamic with parameters for selecting log data
      // TODO DRY this function look up the unique dev_eui in data and build from there

      return new Promise ( function (resolve, reject) {

          let gh_array = []
          let cl_array = []
          let cu_array = []
          let gu_array = []

          // Data format for chartist-js
          // [{x: 'time', y: 'temp'},{...},...]

          // Extract the elements with GenSens data
          let gensensonly = data.filter( function (el) {
              return el.human_payload.MsgID === 'GenSens'
          })

          // Extract the elements specific to a single logger
          let gh = gensensonly.filter ( function (el) {
            return el.dev_eui === '0059ac000015013f'
          })

          gh.forEach( function (el) {

            gh_array.push({
              'x': el.rx_time,
              'y': parseFloat(el.human_payload.Temp)
            })

            gu_array.push({
              'x': el.rx_time,
              'y': parseInt(el.human_payload.Humidity)
            })

          })

          let cl = gensensonly.filter ( function (el) {
            return el.dev_eui === '0059ac000015014d'
          })

          cl.forEach( function (el) {

              cl_array.push({
                'x': el.rx_time,
                'y': parseFloat(el.human_payload.Temp)
              })

              cu_array.push({
                'x': el.rx_time,
                'y': parseInt(el.human_payload.Humidity)
              })
          })

          let merged = {}

          merged['cl'] = cl_array
          merged['gh'] = gh_array
          merged['gu'] = gu_array
          merged['cu'] = cu_array

          resolve(merged)
      })
}

module.exports = utils
