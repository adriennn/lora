require('dotenv').config()

const apiurl = process.env.ONEMTOM_URL
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

      try {

        let hex_o =  Buffer.from(obj.toString(), 'base64').toString('hex')
        let url   = apiurl + hex_o

        console.log('url for 1m2m API: ', url)

        http.get(url, (response) => {

          const { statusCode } = response

          // console.log('1m2m api response:', response)

          if ( statusCode !== 200 ) {

              let error = new Error(`Request Failed with status Code: ${statusCode}`)
              return response.resume()
          }

          let rawdata = ''

          response.on('data', (chunk) => { rawdata += chunk })

          response.on('end', () => {

            if ( Object.keys(rawdata).length === 0 ) {

              err = new Error
              err.message = '1m2m returned empty object'
              return reject(err)
            }

            try {

              const parseddata = JSON.parse(rawdata)

              console.log('Parsed 1m2m response data:', JSON.stringify(parseddata))

              return resolve(parseddata)

            } catch (err) {

              console.error('Error in 1m2m API in decode1m2mpayload()', err)
              return reject(err)
            }
          })

        }).on('error', (err) => {

          console.error(`Http get error: ${err.message}`)
          return reject(err)
        })

      } catch (err) {

        return reject(err)
      }
  })
}

exports.getQualityIndex = (analog1, analog2) => {

    /*
     * Pollution index definition for Winsen ZP01-MP503 gas sensor (input in mV)
     */

    return
    analog1 < 250  && analog2 < 250  ? 'clean'  :
    analog1 < 250  && analog2 > 3000 ? 'light'  :
    analog1 > 3000 && analog2 < 250  ? 'medium' :
                                       'high'
}

exports.extractData = (deveui, mtype) => {

    let data = JSON.parse(fs.readFileSync(path.join(__dirname, '/../config/packets.json'), 'utf8'))

    return new Promise ((resolve, reject) => {

        // deveui is passed as an array
        let devs = deveui

        // init the filtered data obj to be returned by the function
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

        // Testing only
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
                  case 'Move' :
                    // Get the latlng from the Alive messgae
                    fd.devices[dev].data.coords = fd.devices[dev].data.coords || []

                    fd.devices[dev].data.coords.push({
                      'time': packet.rx_time,
                      'latlng': '[' + packet.human_payload.Lat + ',' + packet.human_payload.Lon + ']'
                    })
                  break

                  case '1WireT' :
                  // Extract data from 1Wire temperature sensors packets
                  // all 5 values are sent regardless of the amounf of actual sensors hooked to the device

                    ['OWTemp1', 'OWTemp2', 'OWTemp3', 'OWTemp4', 'OWTemp5'].forEach((i) =>{

                      fd.devices[dev].data[i] = fd.devices[dev].data[i] || []

                      fd.devices[dev].data[i].push({
                        'x': packet.rx_time,
                        'y': parseFloat(packet.human_payload[i])
                      })
                    })
                  break

                  case 'Analog' :
                  // TODO the analog sensors have two inputs
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

              // Remove data we dont usein the UI
              delete fd.devices[dev].raw
          })

          var stop = chrono.Stop()
          console.log( `It took ${stop} ms to parse the data.`)

          // Remove data we dont use in the UI
          delete fd.human_payloads
          delete fd.GenSens

          resolve(fd.devices)

        } catch (err) {

          reject(err)

        }
    })
}
