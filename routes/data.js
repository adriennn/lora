const express     = require('express')
const dataRouter  = express.Router()
const path        = require('path')
const getParams   = require(path.join(__dirname,'/../middleware/getparams.js'))
const showCache   = require(path.join(__dirname,'/../middleware/showcache.js'))
const showDb      = require(path.join(__dirname,'/../middleware/showdb.js'))
const showCommand = require(path.join(__dirname,'/../middleware/showcommand.js'))
const showRecords = require(path.join(__dirname,'/../middleware/showrecords.js'))

// Show either of the requested resources
dataRouter.post('/show/data', getParams, showDb, showCache, showCommand, showRecords)

dataRouter.get('/show', (req, res, next) => {
  res.render('show', {
      title: 'Retrieve resource'
    , id: 'show'
  })
})

module.exports = dataRouter
