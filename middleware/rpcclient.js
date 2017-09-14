require('dotenv').config()

const jayson     = require('jayson')
const client_url = process.env.CLIENT_URL
const https      = process.env.HTTPS
const client     = https? jayson.client.https(client_url) : jayson.client.http(client_url)

console.log('rpc client url', client_url)

client.on('http request', function(req) {
  req.setTimeout(5000)
})

module.exports = client
