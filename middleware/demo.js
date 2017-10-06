require('dotenv').config()

const io = require('socket.io-client')
const ws_url = process.env.WS_CONNECT

module.exports = (req, res, next) => {

    let qrUrl = req.body.url

    console.log(req.body)

    try {

        let socket = io(ws_url, {transports: ['websocket']})

        socket.on('connect', ()=>{
          socket.emit('bmd', qrUrl, (data) => {
            console.log('websocket server respsone data: ', data);
          })
        })

        socket.on('error', (err) => {
          console.log('caught socket error: ', err)
          return next(err)
        })

        socket.on('connect_error', (err) => {
          console.log('caught socket connection error: ', err)
          return next(err)
        });

    } catch (err) {

      return next(err)

    }



    // build api query and send it as promise and catch result to return it to user below

    // send the decoded url/code from the qrcode

    // get token
    const token = 'fake'

    res.render('button', {token: token})

}
