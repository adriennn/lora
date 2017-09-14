const NodeCache    = require('node-cache')
const options      = { stdTTL: 0, checkperiod: 1000000, errorOnMissing: true, }
const commandCache = new NodeCache(options)

// The cache keeps unused data for a bit more than 11 days then purges what's not been explicitely removed

module.exports = commandCache
