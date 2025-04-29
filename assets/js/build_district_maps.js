// -------------------------------------------------------------------------------------->
//
// CREATE DISTRICT MAPS AND SUMMARY TABLES
//
// AUTHOR: Nat Henry, nat@henryspatialanalysis.com
// CREATED: April 2025
// PURPOSE: More performant and flexible district maps for RESPOND
//
// -------------------------------------------------------------------------------------->

// Set visualization options ------------------------------------------------------------>

if(typeof viz_options === 'undefined') {
  var viz_options = {};
}
const default_viz_options = {
  prevalence: {
    pop_cutoff_low: 50,
    pop_cutoff_high: 150,
    use_col: 'pr_m',
    lower: 0.0,
    upper: 0.15,
    fill_palette: [
      '#0D0887','#3E049C','#6300A7','#8707A6','#A62098','#C03A83','#D5546E',
      '#E76F5A','#F58C46','#FDAD32','#FCD225','#F0F921'
    ],
    legend_breaks: ['0%', '5%', '10%', '15%+'],
    legend_title: 'Estimated<br/>HIV Prevalence'
  },
  viraemia: {
    pop_cutoff_low: 50,
    pop_cutoff_high: 150,
    use_col: 'vr_m',
    lower: 0.005,
    upper: 0.020,
    legend_breaks: ['0.5%', '1.0%', '1.5%', '2.0%'],
    fill_palette: [
      '#30123B','#4454C4','#4490FE','#1FC8DE','#29EFA2','#7DFF56','#C1F334',
      '#F1CA3A','#FE922A'
    ],
    legend_title: 'Estimated<br/>HIV Viraemia',
  },
  vls: {
    pop_cutoff_low: 50,
    pop_cutoff_high: 150,
    use_col: 'vl_m',
    lower: 0.7,
    upper: 1.0,
    legend_breaks: ['<=70%', '80%', '90%', '100%'],
    fill_palette: [
      '#440154','#482878','#3E4A89','#31688E','#26828E','#1F9E89','#35B779',
      '#6DCD59','#B4DE2C'
    ],
    legend_title: 'Estimated<br/>Viral Load<br/>Suppression'
  }
}

// Build district-specific maps ------------------------------------------------->

const viraemia_options = {...default_viz_options.viraemia, ...viz_options.viraemia};
create_district_map('hiv-viraemia-map', boundaries, viraemia_options);

const prevalence_options = {...default_viz_options.prevalence, ...viz_options.prevalence};
create_district_map('hiv-prevalence-map', boundaries, prevalence_options);

const vls_options = {...default_viz_options.vls, ...viz_options.vls};
create_district_map('viral-load-suppression-map', boundaries, vls_options);


// Add tables to district pages --------------------------------------------------------->

function import_html_table(path, element_id){
  fetch(path)
    .then(response => response.text())
    .then(data => {
      const containerElement = document.getElementById(element_id);
      containerElement.innerHTML = data;
    });
}

import_html_table('data/' + district_name + '_tas.html', 'traditional-authorities-table');
import_html_table('data/' + district_name + '_facilities.html', 'health-facilities-table');
