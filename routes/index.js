var express = require('express');
var mainRouter = express.Router();

/* GET home page. */
mainRouter.get('/', function(req, res, next) {
  res.render('index', { title: 'Lora' });
});

module.exports = mainRouter;
