const CsvToHtmlTable = {
  init: function (options) {
    options = options || {};
    const csv_path = options.csv_path || "";
    const el = options.element || "table-container";
    const csv_options = options.csv_options || {};
    const custom_formatting = options.custom_formatting || [];
    const customTemplates = {};

    custom_formatting.forEach(([colIdx, func]) => {
      customTemplates[colIdx] = func;
    });

    const table = document.createElement('table');
    table.className = 'table table-striped table-condensed';
    table.id = `${el}-table`;

    const containerElement = document.getElementById(el);
    containerElement.innerHTML = '';
    containerElement.appendChild(table);

    fetch(csv_path)
      .then(response => response.text())
      .then(data => {
        const csvData = this.parseCSV(data, csv_options);
        const tableHead = document.createElement('thead');
        const csvHeaderRow = csvData[0];
        const tableHeadRow = document.createElement('tr');

        csvHeaderRow.forEach(headerText => {
          const th = document.createElement('th');
          th.textContent = headerText;
          tableHeadRow.appendChild(th);
        });

        tableHead.appendChild(tableHeadRow);
        table.appendChild(tableHead);

        const tableBody = document.createElement('tbody');

        for (let rowIdx = 1; rowIdx < csvData.length; rowIdx++) {
          const tableBodyRow = document.createElement('tr');

          for (let colIdx = 0; colIdx < csvData[rowIdx].length; colIdx++) {
            const tableBodyRowTd = document.createElement('td');
            const cellTemplateFunc = customTemplates[colIdx];

            if (cellTemplateFunc) {
              tableBodyRowTd.innerHTML = cellTemplateFunc(csvData[rowIdx][colIdx]);
            } else {
              tableBodyRowTd.textContent = csvData[rowIdx][colIdx];
            }

            tableBodyRow.appendChild(tableBodyRowTd);
          }

          tableBody.appendChild(tableBodyRow);
        }

        table.appendChild(tableBody);
      });
  },

  parseCSV: function(csvText, options) {
    let default_options = {
        delimiter: ',',
        quote: '"'
    }
    options = {...default_options, ...options};
    const lines = csvText.split('\n');
    return lines.map(line => {
      // Basic CSV parsing - can be enhanced based on options
      return this
        .parseRow(line, options.delimiter, options.quote);
    }).filter(line => line.length > 1);
  },

  parseRow: function(row, delimiter, quote){
    var insideQuote = false,
      entries = [],
      entry = [];
    row.split('').forEach(function (character) {
      if(character == quote) {
        insideQuote = !insideQuote;
      } else {
        if(character == delimiter && !insideQuote) {
          entries.push(entry.join(''));
          entry = [];
        } else {
          entry.push(character);
        }
      }
    });
    entries.push(entry.join(''));
    return entries;
  }
};
