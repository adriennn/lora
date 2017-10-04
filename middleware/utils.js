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
    else return 'empty time field'
}

utils.parseLog = (data /* , deveui*/ ) => {

      // TODO make this more dynamic with array or single parameter to tell data from which deveice to use in the log
      // TODO DRY this function
      // TODO look up the unique dev_eui in data and build separate obj from there

      return new Promise ((resolve, reject) => {

          let gh_array = []
          let cl_array = []
          let cu_array = []
          let gu_array = []

          // Data format for chartist-js
          // [{x: 'time', y: 'temp'},{...},...]

          // Extract the elements with GenSens data
          let gensensonly = data.filter((el) => {
              return el.human_payload.MsgID === 'GenSens'
          })

          // Extract the elements specific to a single logger
          let gh = gensensonly.filter ((el) => {
            return el.dev_eui === '0059ac000015013f'
          })

          gh.forEach((el) => {

            gh_array.push({
              'x': el.rx_time,
              'y': parseFloat(el.human_payload.Temp)
            })

            gu_array.push({
              'x': el.rx_time,
              'y': parseInt(el.human_payload.Humidity)
            })

          })

          let cl = gensensonly.filter ((el) => {
            return el.dev_eui === '0059ac000015014d'
          })

          cl.forEach((el) => {

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
