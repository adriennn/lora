
const mongoose = require('mongoose')
const Schema = mongoose.Schema

// TODO list all keys for the uplink schema

const modelPacket = {
  "payload": "AgD/KQZTSCIAhAAAAAAAAA==",
  "port": 1,
  "dev_addr": "17008ab9",
  "radio": {
    "stat": 1,
    "gw_band": "EU863-870",
    "server_time": 1505371122.324747,
    "modu": "LORA",
    "gw_gps": {
      "lat": null,
      "alt": null,
      "lon": null
    },
    "gw_addr": "70b3d54b10540000",
    "chan": 5,
    "gateway_time": 1505371122,
    "datr": "SF12BW125",
    "tmst": 1528005972,
    "codr": "4/5",
    "rfch": 1,
    "lsnr": 5.2,
    "rssi": -102,
    "freq": 868.3,
    "size": 29
  },
  "counter_up": 2920,
  "dev_eui": "0059ac000015013f",
  "rx_time": 1505371122,
  "encrypted_payload": "C5SIwdoFrxfn/JWDCiX19Q==",
  "human_time": "06:38:42",
  "human_payload": {
    "MsgID": "GenSens",
    "BaromBar": "99785",
    "Temp": "16.19",
    "Humidity": "72",
    "LevelX": "34",
    "LevelY": "0",
    "LevelZ": "-124",
    "VibAmp": "0",
    "VibFreq": "0"
  }
}

// const uplinkSchema = new Schema({
//   name: { type: String, default: 'hahaha' },
//   age: { type: Number, min: 18, index: true },
//   bio: { type: String, match: /[a-z]/ },
//   date: { type: Date, default: Date.now },
//   buff: Buffer
// })
//
// // retrieve my model
// var BlogPost = mongoose.model('uplink');
//
// // create a blog post
// var post = new BlogPost();
//
// // create a comment
// post.comments.push({ title: 'My comment' });
//
// post.save(function (err) {
//   if (!err) console.log('Success!');
// });

// module.exports = mongoose.model('uplink', uplinkSchema)
