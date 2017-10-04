const express = require('express')
const router  = express.Router()
const path    = require('path')

// const menuList = [
//   {id: 'listen', title:'Live stream', url:'/lora/form/listen'},
//   {id: 'send', title:'Send data', url:'/lora/form/send'},
//   {id: 'test', title:'Test calls', url:'/lora/form/test'},
//   {id: 'records', title:'Records', url:'/lora/form/records'},
//   {id: 'cache', title:'Commands', url:'/lora/form/cache'},
//   {id: 'db', title:'Database', url:'/lora/form/db'}
// ]

// home page
router.get('/', (req, res, next) => {
  res.render('index',
    { title: 'Lora',
      // data: menuList
    })
})

module.exports = router
