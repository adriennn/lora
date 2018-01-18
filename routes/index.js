const express = require('express')
const router  = express.Router()
const path    = require('path')

// const menu_list = [{
//   id: 'live',
//   title: 'Live stream',
//   url: '/lora/form/live'
// }, {
//   id: 'send',
//   title: 'Commands',
//   url: '/lora/form/send'
// }, {
//   id: 'test',
//   title: 'Test',
//   url: '/lora/form/test'
// }, {
//   id: 'data',
//   title: 'Data',
//   url: '/lora/data'
// }, {
//   id: 'device',
//   title: 'Devices',
//   url: '/lora/form/device'
// }]

// home page
router.get('/', (req, res, next) => {
  res.render('index',
    { title: 'Lora'
      // , menu: JSON.stringify(menu_list)
    })
})

module.exports = router
