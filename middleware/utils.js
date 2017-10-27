require('dotenv').config()

const apiurl = process.env.ONEMTOM_CONNECT
const path   = require('path')
const fs     = require('fs')
const http   = require('http')

/*
 * Timer to measure efficiency of extractions loops
 */
class Chrono {

  Start() {
    this.start = new Date().getTime()
  }

  Stop() {
    return new Date().getTime() - this.start
  }
}

Chrono.start = 0

exports.exportDataToFile = (data) => {

    let packet = data

    // return new Promise ( function (resolve, reject) {})

    // let packetsdatabase = JSON.parse(fs.readFileSync(path.join(__dirname, './../config/packets.json'), 'utf8'))
    let packetsdatabase = require(path.join(__dirname,'/../config/packets.json'))
        packetsdatabase.push(packet)

    fs.writeFileSync(path.join(__dirname, './../config/packets.json'), JSON.stringify(packetsdatabase))
}

exports.decode1m2mpayload = (obj) => {

  /*
   * Decode the encrypted payload sent by 1m2m devices, the API takes in a HEX string
   */

  return new Promise ( function (resolve, reject) {

      console.log('payload to decode from decode1m2mpayload(): ', obj)

      let hex_o =  Buffer.from(obj.toString(), 'base64').toString('hex')
      let url   = apiurl + hex_o

      http.get(url, (response) => {

          const { statusCode } = response

          if (statusCode !== 200) {
              let error = new Error(`Request Failed with status Code: ${statusCode}`)
              return response.resume()
          }

          let rawdata = ''

          response.on('data', (chunk) => { rawdata += chunk })

          response.on('end', () => {

            try {
                const parseddata = JSON.parse(rawdata)
                // console.log('Parsed response data', parseddata.toString())
                resolve(parseddata)

            } catch (err) {
                console.error('Error http res 1m2m API in decode1m2mpayload()', e)
                reject(err)
            }
          })

      }).on('error', (err) => {
        console.error(`Got error: ${err.message}`)
        reject(err)
      })
  })

}

exports.getQualityIndex = (AnIn1, AnIn2) => {

    /*
     * Pollution index definition for Winsen ZP01-MP503 gas sensor (input in mV)
     */

    return
    AnIn1 < 250  && AnIn2 < 250  ? 'clean'  :
    AnIn1 < 250  && AnIn2 > 3000 ? 'light'  :
    AnIn1 > 3000 && AnIn2 < 250  ? 'medium' :
                                   'high'
}

exports.extractData = (deveui, mtype) => {

    let data = JSON.parse(fs.readFileSync(path.join(__dirname, '/../config/packets.json'), 'utf8'))

    return new Promise ((resolve, reject) => {

        // deveui is passed as an array
        let devs = deveui

        // init the filtered data obj to be returned by the promise
        let fd = {}
            fd.devices = {}

        // Filter out anything that's not human_payload
        fd['human_payloads'] = data.filter((el) => {
            return el.human_payload !== undefined
        })

        // Filter the packets by type so we don't parse things we don't need
        fd[mtype] = fd.human_payloads.filter((el) => {
            return el.human_payload['MsgID'] === mtype
        })

        var chrono = new Chrono()

        chrono.Start()

        // Loop through the list of devices and extract the sensors data
        try {

          devs.forEach((dev) => {

              fd.devices[dev] = fd.devices[dev] || {}
              fd.devices[dev].raw = fd.devices[dev].raw || []
              fd.devices[dev].data = fd.devices[dev].data || {}

              // Extract packets specific to a single device
              fd.devices[dev].raw = fd[mtype].filter ((el) => {
                return el.dev_eui === dev
              })

              // Work in progress for some types of messages
              var errwip = new Error
              errwip.message = 'Not implemented yet'
              errwip.status = 403

              // for ( let packet in dev.data_raw ) {
              fd.devices[dev].raw.forEach(packet => {

                // Build the data structure
                switch (mtype) {

                  case 'GenSens' :

                    // We need to do hardcode this for now
                    ['Temp', 'Humidity', 'BaromBar'].forEach((i) => {

                      fd.devices[dev].data[i] = fd.devices[dev].data[i] || []

                      fd.devices[dev].data[i].push({
                        'x': packet.rx_time,
                        'y': parseFloat(packet.human_payload[i])
                      })
                    })

                  break

                  case 'Alive' :
                    reject(errwip)
                  break

                  case '1WireT' :

                    ['OWTemp1', 'OWTemp2', 'OWTemp3', 'OWTemp4', 'OWTemp5'].forEach((i) =>{

                      fd.devices[dev].data[i] = fd.devices[dev].data[i] || []

                      fd.devices[dev].data[i].push({
                        'x': packet.rx_time,
                        'y': parseFloat(packet.human_payload[i])
                      })
                    })

                  break
                  case 'Analog' :
                    reject(errwip)
                  break
                  default : reject(errwip)

                }

                // console.log('fd data_array: ', fd.devices[dev].data_array)

                // Data format for chartist-js donut
                // Data format for chartist-js barchart
                // Data format for chartist-js time series
                // [
                //      {x: 'time', y: 'temp'},
                //    , {...},...]
                //    , ...
                // ]

              })

              delete fd.devices[dev].raw
          })

          var stop = chrono.Stop()
          console.log( `It took ${stop} ms to parse the data.`)

          delete fd.human_payloads
          delete fd.GenSens

          resolve(fd.devices)

        } catch (err) {

          reject(err)

        }
    })
}
