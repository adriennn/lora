socket.on('rpcrequest', function (data) {

  console.log(data);

  var datablock = document.getElementById('datablock');
  var dataline = document.createElement('div');

  var convertTime = function (t) {

    try {

      let time = new Date(t * 1e3)
      time.setHours(time.getHours()+(n*60*60*1000));
      return time.toISOString().slice(-13, -5)

    } catch (err) {

      console.log(err)
      return "error parsing time"
    }
  };

  var humantime;
  var msgid = '';
  var deveui = data.params.dev_eui.toString();
  var method = data.method.toString();

  //- dataline.classList.add('list-group-item');

  if (data.method == 'downlink') {
    humantime = convertTime(tx_time);
    dataline.classList.add('text-white bg-success');
  }
  if (data.method == 'uplink') {
    humantime = convertTime(rx_time);
    msgid = data.params.human_payload.MsgID.toString();
    dataline.classList.add('text-white bg-primary');
  }
  if (data.method == 'error') {
    dataline.classList.add('text-white bg-danger');
  }
  if (data.method == 'status') {
    dataline.classList.add('text-white bg-info');
  }

  dataline.setAttribute("title", JSON.stringify(data, undefined, 3));
  dataline.innerHTML = '<span>' + humantime + ' | method: '+ method + ' | device: ' + deveui + ' | Type: ' + msgid + '</span>';
  datablock.prepend(dataline);
});
