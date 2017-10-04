require('dotenv').config()

const express = require('express')
const demoRouter  = express.Router()
const path    = require('path')
const demo    = require(path.join(__dirname,'../middleware/demo.js'))

demoRouter.get('*', (req, res, next) => {
  res.render('demo', {
    title: 'Zero-config IoT app management',
    id: 'demo'
  })
})

demoRouter.post('*', demo)

module.exports = demoRouter
