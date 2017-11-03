const express     = require('express')
const dataRouter  = express.Router()
const path        = require('path')
const getParams   = require(path.join(__dirname,'/../middleware/getparams.js'))
const showCache   = require(path.join(__dirname,'/../middleware/showcache.js'))
const showDb      = require(path.join(__dirname,'/../middleware/showdb.js'))
const showCommand = require(path.join(__dirname,'/../middleware/showcommand.js'))
const showRecords = require(path.join(__dirname,'/../middleware/showrecords.js'))
const showQueues  = require(path.join(__dirname,'/../middleware/showqueues.js'))


/*
 *
 * Form router to show databases, queues, devices etc...
 * TODO show devices
 */
dataRouter.post('/show/data', getParams, showDb, showCache, showCommand, showQueues, showRecords)

dataRouter.get('/show', (req, res, next) => {
  res.render('show', {
      title: 'Retrieve resource'
    , id: 'show'
  })
})

module.exports = dataRouter
