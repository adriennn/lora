const Queue    = require('bee-queue')
const path     = require('path')
const mongoose = require('mongoose')
const Db       = require(path.join(__dirname,'./db.js'))

const options = {
    prefix: 'bq'
  , stallInterval: 5000
  , nearTermWindow: 1200000
  , delayedDebounce: 1000
  , redis: {
      host: '127.0.0.1'
    , port: 6379
    , db: 0
    , options: {}
  }
  , isWorker: true
  , getEvents: true
  , sendEvents: true
  , storeJobs: true
  , ensureScripts: true
  , activateDelayedJobs: false
  , removeOnSuccess: false
  , removeOnFailure: false
  , redisScanCount: 100
}

const queueUtils = {}

// Dynamically create a queue for each device
// so we can use it to pass data to the UI once
// a socket with given dev_eui connects
queueUtils.createQueue = (deveui, method) => {

    console.log('createQueue() dev_eui', deveui)

    try {

      return new Queue(`{$dev_eui}`, options)

    } catch (err) {

      console.log('Error creating queue: ', err)
      return false
    }
}

const uplinkQueue =  new Queue('uplink', options)

function uplinkLogging (data) {

  let job = uplinkQueue.createJob({data: packet})

      job.save().then((job) => {

          console.log('job id in logging queue: ', job.id)

          processQueue('uplink', data)
      })
}

function processQueue (queuename, data) {

  return `{queuename}`.process((job) => {

    console.log(`Processing job ${job.id}`)

    let model = mongoose.model(`{queuename}`)

    if (queuename === 'uplink') Db.insertData(model, data)

  }).then(() => { console.log(' `{queuename}`: queue processed' )})
}

module.exports = queueUtils
