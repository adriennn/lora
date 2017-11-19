require('dotenv').config()

const express   = require('express')
const apiRouter = express.Router()
const path      = require('path')
const api       = require(path.join(__dirname,'/../middleware/api'))

/*
 * The API access to the lora app
 */
