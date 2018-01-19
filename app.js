                    require('dotenv').config()
const compression = require('compression')
const express     = require('express')
const path        = require('path')
const logger      = require('morgan')
const bodyParser  = require('body-parser')
const Limiter     = require('express-rate-limit')
const csp         = require('helmet-csp')
const bodylogger  = require('morgan-body')
const app         = express()
const server      = require('http').Server(app)
const io          = require('socket.io')(server)

bodylogger(app)

/* Routers */
const mainRoute   = require('./routes/index')
const formRoute   = require('./routes/form')
const rpcRoute    = require('./routes/rpc')
const dataRoute   = require('./routes/data')
const botRoute    = require('./routes/bot')

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

// Trust the nodejs instance as proxy for websockets
app.set('trust proxy', '127.0.0.1')
app.set('subdomain offset', 2)
app.set('json replacer', ' ')
app.set('json space', 4)
app.set('socketio', io)

const limiter = new Limiter({
    windowMs: process.env.APP_REQ_WINDOW
  , max: process.env.APP_REQ_LIMIT
  , delayMs: process.env.APP_REQ_DELAY
})

//  Apply rate limits to all requests
app.use(limiter);

app.use(csp({
  directives: {
    defaultSrc: [  "'self'"],
    connectSrc: [  "'self'"
                  , 'wss://127.0.0.1:5000'
                  , 'http://127.0.0.1:5000'
                  , 'ws://127.0.0.1:5000'
                  , 'https://' + process.env.APP_WEB_URL
                  , 'ws://'    + process.env.APP_WEB_URL
                  , 'wss://'   + process.env.APP_WEB_URL
                  , 'https://api.telegram.org'
                ],

    styleSrc: [  "'self'"
               , "'unsafe-inline'"
               ,  'https://' + process.env.APP_WEB_URL
               ,  'https://cdnjs.cloudflare.com'
               ,  'https://maxcdn.bootstrapcdn.com'
               ,  'https://rawgit.com'
               ,  'https://gitcdn.github.io'
               ,  'https://unpkg.com'
             ],

    scriptSrc: [  "'self'"
                , "'unsafe-inline'"
                ,  'https://cdnjs.cloudflare.com'
                ,  'https://' + process.env.APP_WEB_URL
                ,  'https://cdnjs.cloudflare.com'
                ,  'https://rawgit.com'
                ,  'https://gitcdn.github.io'
                ,  'https://code.jquery.com'
                ,  'https://cdn.jsdelivr.net'
                ,  'https://maxcdn.bootstrapcdn.com'
                ,  'https://unpkg.com'
              ],
    imgSrc: [  "'self'"
              , 'data:'
              , '*'    ]
  }
}))

app.use(compression())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

// attach routes
app.use(express.static(path.join(__dirname, 'public')))
app.use(process.env.APP_ROOT             , mainRoute)
app.use(process.env.APP_ROOT + 'form'    , formRoute)
app.use(process.env.APP_ROOT + 'rpc'     , rpcRoute )
app.use(process.env.APP_ROOT + 'data'    , dataRoute)
app.use(process.env.APP_ROOT + 'telegram', botRoute )

// enable accessing websockets data app-wide
app.use((req, res, next) => {
  req.io = io
  next()
})

// error handler
app.use((err, req, res, next) => {

  // console.log(err)
  // set locals, only providing error in development
  res.locals.path = req.path
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error', {error: res.locals.error})
})

// Finally catch 404 and forward to error handler
app.use((req, res, next) => {
  var err = new Error('Express: Not Found')
  err.status = 404
  next(err)
})

// export both app and server to be enable the use of socketio in req and res everywhere
module.exports = {app: app, server: server}
console.log(`app started at ${process.env.APP_URL} on port ${process.env.PORT}`)

// setup socketio
io.sockets.on('connection', (socket) => {
  console.log('websocket client connect')
})
