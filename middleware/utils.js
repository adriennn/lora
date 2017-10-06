const path = require('path')
const fs   = require('fs')
const http = require('http')
const utils = {}

StopWatch = function()
{
    this.StartMilliseconds = 0;
    this.ElapsedMilliseconds = 0;
}

StopWatch.prototype.Start = function()
{
    this.StartMilliseconds = new Date().getTime()
}

StopWatch.prototype.Stop = function()
{
    this.ElapsedMilliseconds = new Date().getTime() - this.StartMilliseconds
}

utils.exportDataToFile = (data) => {

    let packet = data

    // return new Promise ( function (resolve, reject) {})

    // let packetsdatabase = JSON.parse(fs.readFileSync(path.join(__dirname, './../config/packets.json'), 'utf8'))
    let packetsdatabase = require(path.join(__dirname,'/../config/packets.json'))
        packetsdatabase.push(packet)

    fs.writeFileSync(path.join(__dirname, './../config/packets.json'), JSON.stringify(packetsdatabase))
}

utils.decode1m2mpayload = (obj) => {

  return new Promise ( function (resolve, reject) {

      console.log('payload to decode from decode1m2mpayload(): ', obj)

      const hex_o =  Buffer.from(obj.toString(), 'base64').toString('hex')
      let url = 'http://1m2m.eu/services/GETPAYLOAD?Human=0&PL=' + hex_o

      http.get(url, (res) => {

          const { statusCode } = res

          if (statusCode !== 200) {
              let error = new Error(`Request Failed with status Code: ${statusCode}`)
              console.error(error.message)
              res.resume()
              return
          }

          let rawdata = ''

          res.on('data', (chunk) => { rawdata += chunk })

          res.on('end', () => {

            try {
                const parseddata = JSON.parse(rawdata)
                // console.log('Parsed response data', parseddata.toString())
                resolve(parseddata)

            } catch (e) {
                console.error('Error http res 1m2m API in decode1m2mpayload()', e)
                reject(e.message)
            }
          })

      }).on('error', (e) => {
        console.error(`Got error: ${e.message}`)
        reject(e.message)
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

    if (s) return new Date(s * 1e3).toISOString().slice(-13, -5)
    else return
}

utils.parseLog = (data, deveui) => {

    return new Promise ((resolve, reject) => {

        let devs = deveui

        // init the filtered data obj to be returned by promise
        let fd = {}

        // Extract the elements with GenSens data
        fd.gensens = data.filter((el) => {
            return el.human_payload.MsgID === 'GenSens'
        })

        // 0059ac000015013f & 14d

        /* data structure

        fd.deveui.data_raw {}
        fd.deveui.data_array []
        fd.deveui.data_array.Sensor []


        */

        var s1 = new StopWatch();

        s1.Start();


        // Loop through the list of devices and extract the sensors data
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

                    // Data format for chartist-js
                    // [{x: 'time', y: 'temp'},{...},...]

                    fd[dev].data_array[key] = fd[dev].data_array[key] || []

                    if (packet.human_payload.hasOwnProperty(key)) {

                       fd[dev].data_array[key].push({
                         'x': packet.rx_time,
                         'y': parseFloat(packet.human_payload[key])
                       })
                    }
                }
            }
        })

        console.log('fd at the end: ', fd)

        s1.Stop()

        console.log( 'time elapsed to parse data: ', s1.ElapsedMilliseconds )

        resolve(fd)
    })
}

module.exports = utils
