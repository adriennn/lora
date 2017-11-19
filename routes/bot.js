require('dotenv').config()

const express   = require('express')
const botRouter = express.Router()
const path      = require('path')
const bot       = require(path.join(__dirname,'/../middleware/bot'))

// Pass all requests on this route the bot middleware
botRouter.use(bot)

module.exports = botRouter
