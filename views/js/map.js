
// TODO fetch the first latlg of the data for setting the view and once loaded fit all inside viewport

// TODO hexbins instead of heatmaps
// npm install d3
// npm install d3-hexbin
// npm install leaflet

// console.log('token: ', mapboxtoken.toString())

var map = L.map('map').setView([60.20766, 24.76796], 14);

var tiles = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: mapboxtoken
});

tiles.addTo(map);

// console.log('coordinates: ', points);

var geoJsonLayer = L.geoJSON().addTo(map);

// var geoJsonFeatures = []
var heatpointdata = [];

for (var device in points) {

  points[device].data.coords.forEach((item) => {

    // Simple markers
    // return new L.Marker(JSON.parse(item.latlng)).addTo(map);

    // GeoJSON markers
    // let geoJsonFeature = {
    //   "type": "Feature",
    //   "properties": {
    //       "time": new Date(item.time)
    //   },
    //   "geometry": {
    //       "type": "Point",
    //       "coordinates": JSON.parse(item.latlng)
    //   }
    // };

    let heatpoint = JSON.parse(item.latlng);

    // Add intensity of 1 for each point
    heatpoint.push(1);

    // console.log(heatpoint)

    // geoJsonFeatures.push(geoJsonFeature)

    heatpointdata.push(heatpoint);

    // geoJsonLayer.addData(geoJsonFeature)

  })
}

var pointHeatLayer = L.heatLayer(heatpointdata, {radius: 20}).addTo(map);

// console.log('geoJsonFeatures: ', geoJsonFeatures)

// var geojsonMarkerOptions = {
//     radius: 8,
//     fillColor: "#ff7800",
//     color: "#000",
//     weight: 1,
//     opacity: 1,
//     fillOpacity: 0.8
// };
//
// function onEachFeature(feature, layer) {
//     // does this feature have a property named popupContent?
//     if (feature.properties && feature.properties.time) {
//         layer.bindPopup(feature.properties.time);
//     }
// };
//
// L.geoJSON(geoJsonFeatures, {
//     onEachFeature: onEachFeature,
//     pointToLayer: function (feature, latlng) {
//         return L.circleMarker(latlng, geojsonMarkerOptions);
//     }
// }).addTo(map);
