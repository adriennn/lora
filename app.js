var compression = require('compression'),
    express = require('express'),
    path = require('path'),
    logger = require('morgan'),
    bodyParser = require('body-parser'),
    jayson = require('jayson'),
    helmet = require('helmet'),
    bodylogger = require('morgan-body');

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

// better logger
bodylogger(app);
// set a shorter timeout
// server.timeout = 5000;

var mainroute = require('./routes/index'),
    formroute = require('./routes/form'),
    rpcroute = require('./routes/rpc');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.set('trust proxy', true);
app.set('subdomain offset', 2);
app.set('json replacer', ' ');
app.set('json space', 4);

// attach third-party middleware to app root
app.use(helmet());
app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// setup sockets
io.sockets.on('connection', function (socket) {
    console.log('client connect');
    socket.on('echo', function (data) {
        io.sockets.emit('message', data);
    });
});
app.use(function(req, res, next) {
  // set the sock in the req so we can access it anywhere
  req.io = io;
  next();
});

// attach routes
app.use(express.static(path.join(__dirname, 'public')));
app.use('/lora/', mainroute);
app.use('/lora/form', formroute);
app.use('/lora/rpc', rpcroute);

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.path = req.path;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Express: Not Found');
  err.status = 404;
  next(err);
});

// export both app and server to be able to use socketio in req and res everywhere
module.exports = {app: app, server: server};
console.log('app started on port 5000 of localhost');