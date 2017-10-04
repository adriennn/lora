const path  = require('path')
const mongoose = require('mongoose')
// const queue = require(path.join(__dirname,'./queue.js'))
// const db    = require(path.join(__dirname,'./db.js'))

module.exports = (req, res, next) => {

  console.log('hit sortpackets() req', req.body)

  let dev_eui = req.body.params.dev_eui
  let method = req.body.method

  // For any incoming request we put it in a device queue which dispatch jobs according to methods types
  // queue.createQueue(dev_eui, method)

  // We make a specific schema for uplink packets, the other packets are just dumped into the db
  // TODO


  // TODO separate collections with linked schemas

     /*DB*/      /*SCHEMA*/    /*DOCUMENT*/
  ////////////  ////////////   ////////////
  //        //  //        //   //        //
  // DEVEUI //  // UPLINK //   // PACKET //
  //        //  //        //   //        //
  ////////////  ////////////   ////////////

                 /*SCHEMA*/    /*DOCUMENT*/
                ////////////   ////////////
                //        //   //        //
                // DLINK  //   // PACKET //
                //        //   //        //
                ////////////   ////////////

  try {

      // Try to load up a schema with the dev_eui
      // let myDevice = mongoose.model(dev_eui).schema

  } catch (err) {

      try {

          // If there's no schema for the device create a new one
          // let myPacket = new myDevice()

      } catch (err) {

          return next(err)

      }

  }

  return res.end()

}
