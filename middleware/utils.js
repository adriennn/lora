require('dotenv').config()

const apiurl = process.env.ONEMTOM_CONNECT
const path   = require('path')
const fs     = require('fs')
const http   = require('http')
const utils  = {}

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

utils.exportDataToFile = (data) => {

    let packet = data

    // return new Promise ( function (resolve, reject) {})

    // let packetsdatabase = JSON.parse(fs.readFileSync(path.join(__dirname, './../config/packets.json'), 'utf8'))
    let packetsdatabase = require(path.join(__dirname,'/../config/packets.json'))
        packetsdatabase.push(packet)

    fs.writeFileSync(path.join(__dirname, './../config/packets.json'), JSON.stringify(packetsdatabase))
}

utils.decode1m2mpayload = (obj) => {

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

utils.getQualityIndex = (AnIn1, AnIn2) => {

    /*
     * Pollution index definition for Winsen ZP01-MP503 gas sensor (input in mV)
     */

    return
    AnIn1 < 250  && AnIn2 < 250  ? 'clean'  :
    AnIn1 < 250  && AnIn2 > 3000 ? 'light'  :
    AnIn1 > 3000 && AnIn2 < 250  ? 'medium' :
                                   'high'
}

utils.convertTime = (s) => {

    /*
     * Get hh:mm:ss to show packet arrival time in live stream
     */

    if (s) return new Date(s * 1e3).toISOString().slice(-13, -5)
    else return
}

utils.extractData = (data, deveui, type) => {

    // TODO db lookup before going further

    return new Promise ((resolve, reject) => {

        let devs = deveui

        // init the filtered data obj to be returned by the promise
        let fd = {}

        // Extract the elements with GenSens data
        fd.gensens = data.filter((el) => {
            return el.human_payload.MsgID === 'GenSens'
        })

        /* data structure

        fd.deveui.data_raw {}
        fd.deveui.data_array []
        fd.deveui.data_array.Sensor []

        */

        var chrono = new Chrono()

        chrono.Start()


        // TODO external function to extract GenSens, Analog, 1Wire, GPS + Vibrate

        // Loop through the list of devices and extract the sensors data
        try {

          devs.forEach((dev, index) => {

              fd[dev] = fd[dev] || {}
              fd[dev].data_raw = fd[dev].data_raw || {}
              fd[dev].data_array = fd[dev].data_array || []

              console.log('fd: ', fd)
              console.log('fd dev: ', fd[dev])

              // Extract packets specific to a single device
              fd[dev].data_raw = fd.gensens.filter ((el) => {
                return el.dev_eui === dev
              })

              // Object.keys(fd[dev].data_raw).forEach((el) => {
              for (let i = 0, keys = Object.keys(fd[dev].data_raw); i < keys.length; i++) {
              }

              for ( let packet in fd[dev].data_raw ) {

                  for ( let key in packet.human_payload ) {

                      // Data format for chartist-js time series
                      // [
                      //      {x: 'time', y: 'temp'},
                      //    , {...},...]
                      //    , ...
                      // ]

                      // TODO
                      // Data format for chartist-js donut
                      // Data format for chartist-js barchart

                      fd[dev].data_array[key] = fd[dev].data_array[key] || []

                      if (packet.human_payload.hasOwnProperty(key)) {

                         fd[dev].data_array[key].push({
                           'x': packet.rx_time,
                           'y': parseFloat(packet.human_payload[key])
                         })
                      }
                  }
              }

              console.log('fd[dev]: ', fd[dev])
          })

          console.log('fd at the end: ', fd)

          console.log( 'Milliseconds taken to parse data: ', chrono.Stop() )

          resolve(fd)

        } catch (err) {

          reject(err)

        }
    })
}

module.exports = utils
