const path = require('path')
const fs   = require('fs')
const http = require('http')
const utils = {}

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

        let exdata = {}

        // Extract the elements with GenSens data
        exdata.gensensonly = data.filter((el) => {
            return el.human_payload.MsgID === 'GenSens'
        })

        devs.forEach((dev, index) => {

            let devstring = dev.toString().trim()

            // Extract packets specific to a single device
            exdata[dev].data = exdata.gensensonly.filter ((el) => {
              return el.dev_eui === devstring
            })

            exdata[dev].data_array = []

            // TODO dynamically generate from the keys in human_payload
            exdata[dev].data.forEach((el) => {

                // Data format for chartist-js
                // [{x: 'time', y: 'temp'},{...},...]

                exdata[dev].data_array.push({
                  'x': el.rx_time,
                  'y': parseFloat(el.human_payload.Temp)
                })

                exdata[dev].data_array.push({
                  'x': el.rx_time,
                  'y': parseInt(el.human_payload.Humidity)
                })
            })
        })

        resolve(exdata)
    })
}

module.exports = utils
