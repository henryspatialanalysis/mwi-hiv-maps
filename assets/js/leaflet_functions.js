// Helper functions to render outcomes in labels ---------------------------------------->
// Create comma-separated numbers
function cma(outcome) {
  const rounded = Math.round(outcome/10) * 10;
  return rounded.toLocaleString(undefined, {maximumFractionDigits: 10});
}
// Create percentage strings
function pct(outcome, acc = 0.1, suffix = true) {
  const suffixMark = suffix ? "%" : "";
  return (outcome * 100).toFixed(acc) + suffixMark;
}


// Create labels for map areas ---------------------------------------------------------->
function poly_tooltop(layer, ind_suffix = ''){
  const props = layer.feature.properties;
  const cols = Object.keys(props);
  const LOW_POP_CUTOFF = 50;

  // Add potential place titles
  var inner_html = '';
  var titles = [];
  const titleLabels = {
    gvhname: 'GVH: ',
    taname: '',
    closest_facility_name: '',
    survey_facility_name: '',
  }
  Object.entries(titleLabels).forEach(([key, label]) => {
    if(cols.includes(key)){
      titles.push(`<b>${label}${props[key]}</b>`);
    }
  });
  inner_html += titles.join('<br/>');
  if(inner_html != ''){
    inner_html += '<br/>';
  }

  // Add indicators to labels
  var labs = [];
  const indLabels = {
    viraemia: 'HIV viraemia',
    prev: 'HIV prevalence',
    vls: 'Viral load suppression'
  };
  Object.entries(indLabels).forEach(([ind, indLabel]) => {
    const acc = ind === 'vls' ? 1 : 0.1;
    const meanVar = `${ind}15to49_mean${ind_suffix}`;
    const uiVars = [`${ind}15to49_lower${ind_suffix}`, `${ind}15to49_upper${ind_suffix}`];
    var this_lab = '';
    if (cols.includes(meanVar)) {
      this_lab += `<i>${indLabel}</i>: ${(props[meanVar] * 100).toFixed(acc)}%`;
    }
    if (uiVars.every(v => cols.includes(v))) {
      this_lab += ` (${pct(props[uiVars[0]], acc)} to ${pct(props[uiVars[1]], acc)})`;
    }
    labs.push(this_lab);
  });

  // Censor outcomes for small populations
  if (cols.includes('pop_15to49')) {
    if(props.pop_15to49 < LOW_POP_CUTOFF) {
      labs = [`<i>Population</i>: < ${cma(LOW_POP_CUTOFF)}`];
    } else {
      labs.push(`<i>Population</i>: ${cma(props.pop_15to49)}`);
    }
  }
  inner_html += labs.join('<br/>');

  return inner_html;
}

// Helper function to create a GeoJSON layer for Leaflet
function new_geojson(data, ind_suffix = ''){
  return L
    .geoJSON(data)
    .bindTooltip(function(layer){
      return poly_tooltop(layer, ind_suffix);
    });
}

function new_tile(url, options){
  const default_options = {
    attribution: '',
    subdomains: 'abcd',
    maxzoom: 20
  }
  return L.tileLayer(url, options || default_options);
}

// Template to create a leaflet map
// Assumes the div with id map already exists
function create_map(id, bounds) {
  // Create map
  const map = L.map(id);
  const bounds_keys = Object.keys(bounds);
  // Add base layers
  new_tile(
    'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png',
    {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>, ' +
        '<a href="https://carto.com/attributions">CARTO</a>, ' +
        '<a href="https://www.stadiamaps.com/">Stadia</a>'
    }
  ).addTo(map);
  new_tile(
    'https://tiles.stadiamaps.com/tiles/stamen_toner_lines/{z}/{x}/{y}{r}.png',
    {subdomains: ''}
  ).addTo(map);
  new_tile(
    'https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png'
  ).addTo(map);

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
  base_layers['High resolution'] = new_geojson(bounds.h3).addTo(map);
  base_layers['Group village head'] = new_geojson(bounds.gvh, ind_suffix = '_gvh');
  base_layers['Traditional authority'] = new_geojson(bounds.ta);
  base_layers['Facility catchment'] = new_geojson(
    bounds.closest_facilities,
    ind_suffix = '_gcf'
  );
  // Add layers that may not exist: survey facilities
  if(bounds_keys.includes('survey_facilities')){
    base_layers['Survey facilities'] = new_geojson(
      bounds.survey_facilities,
      ind_suffix = '_scf'
    );
  }
  // Add optional layers:
  var optional_layers = {};
  optional_layers['Health facility locations'] = new_geojson(bounds.facility_points);
  if(bounds_keys.includes('dropped_facility_points')){
    optional_layers['<i>(Excluded health facilities)</i>'] = new_geojson(
      bounds.dropped_facility_points
    );
  }
  optional_layers['Facility catchment<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;boundaries'] = L.geoJSON(
    bounds.closest_facilities,
    {
      style: {
        opacity: 0.85,
        color: "#0000FF",
        dashArray: "5, 10",
        fillOpacity: 0
      }
    }
  );
  const layerControl = L.control.layers(
    base_layers, optional_layers, {
      collapsed: false,
    }
  );
  layerControl.addTo(map);
}
