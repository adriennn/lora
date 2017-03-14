var express = require('express'),
    path = require('path'),
    logger = require('morgan'),
    bodyParser = require('body-parser'),
    jayson = require('jayson'),
    helmet = require('helmet');

var app = express();

var mainroute = require('./routes/index'),
    formroute = require('./routes/form'),
    rpcroute = require('./routes/rpc');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// attach thrid-party middleware to app root
//app.use(helmet());
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// attach routes
app.use(express.static(path.join(__dirname, 'public')));
app.use('/lora/', mainroute);
app.use('/lora/form', formroute);
app.use('/lora/rpc', rpcroute);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Express: Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.path = req.path;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
console.log('app started on port 5000 of localhost');