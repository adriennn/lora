//- sensors data is in {df}.{dev_eui}.{data}.[Temp | BaromBar | Humidity]
console.log(df);

for (var device in df) {

  if (df.hasOwnProperty(device)) {

    for (var sensor in df[device].data) {

      if (df[device].data.hasOwnProperty(sensor)) {

        df[device].data[sensor].forEach((item) => {

          item.x = new Date(item.x * 1e3)
        })
      }
    }
  }
}

var mySeries = []
var myLegend = []

for (var device in df) {
  if (df.hasOwnProperty(device)) {

    for (var sensor in df[device].data) {
      if (df[device].data.hasOwnProperty(sensor)) {

        var myDeviceData = {
          name: device + '-' + sensor,
          data: df[device].data[sensor]
        }

        myLegend.push(sensor)

        mySeries.push(myDeviceData)
      }
    }
  }
}

var options = {
  height: '600',
  axisX: {
    type: Chartist.AutoScaleAxis,
    labelInterpolationFnc: function(value) {
      return moment(value).format('D.M H:mm');
    }
  },
  axisY: {
    type: Chartist.AutoScaleAxis,
    high: 100,
    low: -10
  },
  plugins: [
    // Chartist.plugins.legend({
    //   legendNames: myLegend,
    //   classNames : myLegend
    // }),
    Chartist.plugins.zoom({
      onZoom : onZoom
    }),
    //- Chartist.plugins.ctThreshold({ threshold: threshold }),
    Chartist.plugins.ctMultiThreshold({
            threshold: [0, 10, 25]
        })
    //- Chartist.plugins.tooltip()
  ]
};

var data = {
  series: mySeries
};

var responsiveOptions = [
  ['screen and (min-width: 400px)', {
    showPoint: false,
    height: '300'
    }],
  ['screen and (max-width: 399px)', {
    height: '300'
  }]
];

var chart = new Chartist.Line('#graph', data, options, responsiveOptions);

var resetFnc;

function onZoom(chart, reset) {
  resetFnc = reset;
}

var buttonReset = document.getElementById('reset');

buttonReset.addEventListener('click', function () {
  resetFnc && resetFnc();
});

// Dynamic styling of lines
// chart.on('draw', function(context) {
//
//   var max = 100;
//
//   if(context.type === 'line') {
//     console.log('context', context)
//     context.element.attr({
//       style: 'stroke: hsl(' + Math.floor(Chartist.getMultiValue(context.value) / max * 100) + ', 50%, 50%);'
//     });
//   }
// });

// var buttonSet = document.getElementById('setty');
// var inputSet = document.getElementById('inputty');

/*buttonSet.addEventListener('click', function () {

  options.plugins.ctMultiThreshold = {threshold: [1, 2, 5]};

  chart.update(null, options.plugins, true);
});*/
