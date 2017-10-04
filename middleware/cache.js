const NodeCache = require('node-cache')
const options   = { stdTTL: 0, checkperiod: 86400, errorOnMissing: true, }
const cache     = new NodeCache(options)

// The cache keeps unused data for a day and then the cached data is saved on disk
module.exports = cache
