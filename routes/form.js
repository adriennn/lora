require('dotenv').config()

const express            = require('express')
const formRouter         = express.Router()
const path               = require('path')
const fs                 = require('fs')
const saveCommandToQueue = require(path.join(__dirname,'/../middleware/savecommandtoqueue.js'))
const makeManualRpcCall  = require(path.join(__dirname,'/../middleware/manualrpccall.js'))
const getParams          = require(path.join(__dirname,'/../middleware/getparams.js'))
const validateReq        = require(path.join(__dirname,'/../middleware/validaterequest.js'))
const { body }           = require('express-validator/check')
const addNewDevice       = require(path.join(__dirname,'/../middleware/addnewdevice.js'))
const db                 = require(path.join(__dirname,'/../middleware/dbutils.js'))

formRouter.get('/test', (req, res, next) => {
  res.render('test', {
      title : 'Test RPC calls'
    , id    : 'test'
  })
})

formRouter.get('/live', (req, res, next) => {

  const iosourceurl = process.env.IO_CONNECT

  console.log('io source: ', iosourceurl)

  res.render('live', {
      title : 'RPC calls live feed'
    , id    : 'live'
    , iourl : iosourceurl
  })
})

formRouter.get('/send', (req, res, next) => {
  res.render('send', {
      title: 'Send data to a device'
    , id: 'send'
  })
})

formRouter.get('/device', db.listDevices, (req, res, next) => {
  res.render('device', {
      title: 'Manage devices'
    , id: 'device'
    , devicelist: res.locals.devicelist
  })
})

// We enforce strict alphanumeric input for all form fields
formRouter.post('*', body('*.*').isAlphanumeric(), validateReq, getParams, saveCommandToQueue, makeManualRpcCall, addNewDevice)

module.exports = formRouter
