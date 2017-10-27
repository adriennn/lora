require('dotenv').config()

const redis_url   = process.env.REDIS_CONNECT
const redis_port  = process.env.REDIS_PORT
const RSMQPromise = require('rsmq-promise');
const rsmq        = new RSMQPromise( {host: redis_url, port: redis_port, ns: "rsmq"} )

module.exports = rsmq
