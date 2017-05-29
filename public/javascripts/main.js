var socket = io('https://garbagepla.net/lora/rpc');
socket.on('rpcrequest', function (data) {
  console.log(data);
  var datablock = document.getElementById('datablock');
  var dataline = document.createElement('li');
  dataline.classList.add('list-group-item');

  if (data.method == 'downlink') {
    dataline.classList.add('list-group-item-success');
    }
  if (data.method == 'uplink') {
    dataline.classList.add('list-group-item-info');
    }
  if (data.method == 'error') {
    dataline.classList.add('list-group-item-danger');
    }
  if (data.method == 'status') {
    dataline.classList.add('list-group-item-warning');
    }        
  dataline.setAttribute("title", JSON.stringify(data, undefined, 3));
  datablock.prepend(dataline);
  dataline.innerHTML = '<span>'+ data.method.toString() +'</span>';
});