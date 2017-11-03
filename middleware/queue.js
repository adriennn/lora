require('dotenv').config()

const redis_url      = process.env.REDIS_CONNECT
const redis_port     = process.env.REDIS_PORT
const redis_password = process.env.REDIS_PWD
const RSMQPromise    = require('rsmq-promise');
const rsmq           = new RSMQPromise( {host: redis_url, port: redis_port, ns: "rsmq"} )

// if (process.env.NODE_ENV === 'production') rsmq.auth(redis_password)

module.exports = rsmq
