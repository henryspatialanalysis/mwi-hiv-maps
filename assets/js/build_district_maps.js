// Script used to build district-specific maps
create_map('hiv-viraemia-map', boundaries);
create_map('hiv-prevalence-map', boundaries);
create_map('viral-load-suppression-map', boundaries);

// Fill tables with placeholders
document.getElementById('traditional-authorities-table').innerHTML = '<strong>PLACEHOLDER</strong>';
document.getElementById('health-facilities-table').innerHTML = '<strong>PLACEHOLDER</strong>';
