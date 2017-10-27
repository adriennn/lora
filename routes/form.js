require('dotenv').config()

const express            = require('express')
const formRouter         = express.Router()
const path               = require('path')
const fs                 = require('fs')
const saveCommandToQueue = require(path.join(__dirname,'/../middleware/savecommandtoqueue.js'))
const makeManualRpcCall  = require(path.join(__dirname,'/../middleware/manualrpccall.js'))
const getParams          = require(path.join(__dirname,'/../middleware/getparams.js'))
const sanitizeReq        = require(path.join(__dirname,'/../middleware/sanitize.js'))
const addNewDevice       = require(path.join(__dirname,'/../middleware/addnewdevice.js'))
const { body }           = require('express-validator/check')
const { listDevices }    = require(path.join(__dirname,'/../middleware/dbutils.js'))

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
      title: 'Send data to a device'
    , id: 'send'
  })
})

formRouter.get('/device', listDevices, (req, res, next) => {
  res.render('device', {
      title: 'Manage devices'
    , id: 'device'
    , devices: res.locals.devicelist
  })
})

// We enforce strict alphanumeric input for all form fields because there is no need for other characters
// TODO middleware routing here or in getparams instead of inside middleware body
formRouter.post('*', body('*.*').isAlphanumeric(), sanitizeReq, getParams, saveCommandToQueue, makeManualRpcCall, addNewDevice)

module.exports = formRouter
