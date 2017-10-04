require('dotenv').config()

const express            = require('express')
const formRouter         = express.Router()
const path               = require('path')
const fs                 = require('fs')
const saveCommandToCache = require(path.join(__dirname,'/../middleware/savecommandtocache.js'))
const makeManualRpcCall  = require(path.join(__dirname,'/../middleware/manualrpccall.js'))
const getParams          = require(path.join(__dirname,'/../middleware/getparams.js'))

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

formRouter.post('*', getParams, saveCommandToCache, makeManualRpcCall)

module.exports = formRouter
