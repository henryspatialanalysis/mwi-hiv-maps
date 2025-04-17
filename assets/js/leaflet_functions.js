// Functions to create lealet maps
// Assumes leaflet.js is already loaded

// Template to create a leaflet map
// Assumes the div with id map already exists
function create_map(id, bounds) {
  // Create map
  const map = L.map(id);
  // Add base layers
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
  }).addTo(map);
  L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_toner_lines/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 20,
  }).addTo(map);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
  }).addTo(map);
  // Add district boundaries
  const district_layer = L.geoJSON(bounds.district, {
    style: {
      color: 'black',
      fillOpacity: 0,
      weight: 2
    }
  }).addTo(map);
  map.fitBounds(district_layer.getBounds());
  // Create all toggleable layers
  var base_layers = {};
  base_layers['High resolution'] = L.geoJSON(bounds.h3);
  base_layers['Group village head'] = L.geoJSON(bounds.gvh);
  base_layers['Traditional authority'] = L.geoJSON(bounds.ta);
  base_layers['Facility catchment'] = L.geoJSON(bounds.closest_facilities);
  const layerControl = L.control.layers(base_layers).addTo(map);
}
