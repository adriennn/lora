require('dotenv').config()

const jayson     = require('jayson')
const client_url = process.env.APP_URL + ':' + process.env.PORT + process.env.APP_ROOT + process.env.RPC_CLIENT_URL
const https      = process.env.HTTPS
const client     = https ? jayson.client.https(client_url) : jayson.client.http(client_url)

console.log('rpc client url', client_url)

client.on('http request', (req) => {
  req.setTimeout(5000)
})

module.exports = client
