// Store our API endpoint as queryUrl.
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a Get request to the query URL
d3.json(queryUrl).then(function (data) {
    // Console log the data retrieved
    console.log(data);
    // Once we get a response, send the data.features object to the createFeatures function.
    createFeatures(data.features);
});

// Create a function to determine the size of the markers
function markerSize(magnitude) {
    return magnitude * 17000;
};

// Create a function to determine the color of the markers
function chooseColor(depth){
    return depth > 90 ? "rgba(255,95,101,255)" :
           depth > 70 ? "rgba(252,163,93,255)" :
           depth > 50 ? "rgba(253,183,42,255)" :
           depth > 30 ? "rgba(247,219,17,255)" :
           depth > 10 ? "rgba(220,244,0,255)" :
                        "rgba(163,246,0,255)"; // default color
}

function createFeatures(earthquakeData) {
    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3>${feature.properties.place}</h3><hr>
                         <p>Magnitude: ${feature.properties.mag}</p>
                         <p>Depth: ${feature.geometry.coordinates[2]}</p>`);
    }

    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,

        pointToLayer: function(feature, latlng) {

            // Determine the style of markers based on properties
            var markers = {
                radius: markerSize(feature.properties.mag),
                fillColor: chooseColor(feature.geometry.coordinates[2]),
                fillOpacity: 0.8,
                color: "black",
                weight: 1
            }
            return L.circle(latlng,markers);
        }
    });

    createMap(earthquakes);
}

function createMap(earthquakes) {

    // Create tile layer
    var grayscale = L.tileLayer('https://api.mapbox.com/styles/v1/{style}/tiles/{z}/{x}/{y}?access_token={access_token}', {
        attribution: "© <a href='https://www.mapbox.com/about/maps'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://wwww.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        style: 'mapbox/light-v11',
        access_token: api_key
    });

    // Initialize the map
    var myMap = L.map("map", {
        center: [
            38.070, -115.7129
        ],
        zoom: 6,
        layers: [grayscale, earthquakes]
    });

    // Add legend
    var legend = L.control({position: "bottomright"});
    legend.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend"),
        depth = [-10, 10, 30, 50, 70, 90];

        div.innerHTML += "<h3 style='text-align: center'>Depth Legend</h3>"

        for (var i = 0; i < depth.length; i++) {
            div.innerHTML +=
            '<i style="background:' + chooseColor(depth[i] + 1) + '"></i> ' + depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+');
        }
        return div;
    };
    legend.addTo(myMap)
};