const compression = require('compression')
const express = require('express')
const path = require('path')
const logger = require('morgan')
const bodyParser = require('body-parser')
const jayson = require('jayson')
const csp = require('helmet-csp')
const bodylogger = require('morgan-body')

var app = express()
var server = require('http').Server(app)
var io = require('socket.io')(server)

bodylogger(app)

const mainroute = require('./routes/index')
const formroute = require('./routes/form')
const rpcroute = require('./routes/rpc')

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')
// Trust this proxy for sockets
app.set('trust proxy', '127.0.0.1')
app.set('subdomain offset', 2)
app.set('json replacer', ' ')
app.set('json space', 4)
app.set('socketio', io)

// attach third-party middleware to app root
app.use(csp({
  directives: {
    defaultSrc: ["'self'"],
    connectSrc: ["'self'", 'wss://127.0.0.1:5000', 'http://127.0.0.1:5000', 'ws://127.0.0.1:5000', 'https://garbagepla.net', 'ws://garbagepla.net', 'wss://garbagepla.net'],
    styleSrc: ["'self'", "'unsafe-inline'", 'https://garbagepla.net', 'https://cdnjs.cloudflare.com', 'https://rawgit.com'],
    scriptSrc: ["'self'", 'cdnjs.cloudflare.com', "'unsafe-inline'", 'https://garbagepla.net', 'https://cdnjs.cloudflare.com', 'https://rawgit.com']
  }
}))

app.use(compression())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

// attach routes
app.use(express.static(path.join(__dirname, 'public')))
app.use('/lora/', mainroute)
app.use('/lora/form', formroute)
app.use('/lora/rpc', rpcroute)

// setup socketio
io.sockets.on('connection', (socket) => {
  console.log('client connect')
})

app.use((req, res, next) => {
  req.io = io
  next()
})

// error handler
// app.use((err, req, res, next) => {
//   // set locals, only providing error in development
//   res.locals.path = req.path
//   res.locals.error = req.app.get('env') === 'development' ? err : {}
//   // render the error page
//   res.status(err.status || 500)
//   res.render('error')
// })
//
// // catch 404 and forward to error handler
// app.use((req, res, next) => {
//   var err = new Error('Express: Not Found')
//   err.status = 404
//   next(err)
// })

app.use((err, req, res, next) => {
  console.log('error: ', err)
  res.status(500).send('Something broke!')
})

// export both app and server to be enable the use of socketio in req and res everywhere
module.exports = {app: app, server: server}
console.log('app started at http://localhost:5000/lora')
