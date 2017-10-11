require('dotenv').config()

const express            = require('express')
const formRouter         = express.Router()
const path               = require('path')
const fs                 = require('fs')
const saveCommandToCache = require(path.join(__dirname,'/../middleware/savecommandtocache.js'))
const makeManualRpcCall  = require(path.join(__dirname,'/../middleware/manualrpccall.js'))
const getParams          = require(path.join(__dirname,'/../middleware/getparams.js'))
const sanitizeReq        = require(path.join(__dirname,'/../middleware/sanitize.js'))
const { body }           = require('express-validator/check')


formRouter.get('/test', (req, res, next) => {
  res.render('test', {
      title : 'Test RPC calls'
    , id    : 'test'
  })
})

formRouter.get('/listen', (req, res, next) => {

  var iosourceurl = process.env.IO_CONNECT

  console.log('io source: ', iosourceurl)

  res.render('listen', {
      title       : 'Listen to RPC calls'
    , id          : 'listen'
    , iosourceurl : iosourceurl
  })
})

formRouter.get('/send', (req, res, next) => {
  res.render('send', {
    title: 'Send data to a device',
    id: 'send'
  })
})

// We enforce strict alphanumeric input for all form fields because there' is no need for other characters
formRouter.post('*', body('*.*').isAlphanumeric(), sanitizeReq, getParams, saveCommandToCache, makeManualRpcCall)

module.exports = formRouter
