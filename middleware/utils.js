var path = require('path'),
    fs   = require('fs');

var utils = function utils (req, res, next) {
  exportDataToFile : function () {},
  catchRpc : function (req, res, next) {},
  decode1m2mpayload : function (obj) {},
  getQualityIndex : function (AnIn1, AnIn2) {},
  set1m2mCommandString : function (command, payload) {

      switch (command) {

          case 'reboot'    : return '0xFEFEFE'          ;
          case 'setAPPEUI' : return '0xFD'     + payload;  // 01FD0102030405060708
          case 'setABP'    : return '0x'       + payload;  // 01FC0102030405060708090A0B0C0D0E0F10111213141516171819101A1B1C1D1E1F20212223
          case 'reset'     : return '0xEFFFFE'          ;  // device flashes before rebooting
          case 'UTSensors' : return '0x0A'     + payload;  // payload is the default sensor update time in minutes, 0 to disbale
          case 'UTAnalog'  : return '0x20'     + payload;  // analog sensors, default is 0 (off), time in minutes
          case 'UTIdle'    : return '0x07'     + payload;  // time to send updated data when device is idle (i.e. not moving, no vibrations) set to one min : 080701
        }
    }
};

module.exports = utils;
