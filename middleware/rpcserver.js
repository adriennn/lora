const path    = require('path')
const jayson  = require('jayson')
const methods = require(path.join(__dirname,'./methods.js'))

const server  = jayson.server(methods.everynet, {params: Object})

module.exports = server
