require('dotenv').config()

const io = require('socket.io-client')
const ws_url = process.env.WS_URL

module.exports = (req, res, next) => {

    let qrurl = req.body.url

    let socket

    console.log('req body: ', req.body)

    try {

        socket = io(ws_url, {transports: ['websocket']})

        socket.on('connect', ()=>{
          socket.emit('bmd', qrurl, (data) => {
            console.log('websocket server respsone data: ', data);
          })
        })

    } catch (err) {

      return next(err)

    }

    socket.on('error', (err) => {
      console.log('caught socket error: ', err)
      return next(err)
    })

    socket.on('connect_error', (err) => {
      console.log('caught socket connection error: ', err)
      return next(err)
    });

    // build api query and send it as promise and catch result to return it to user below

    // get token
    const token = 'fake'

    // TODO don't actually send the token to the UI, keep it in auth db with userid ref

    res.render('button', {token: token})

}
