import { searchFilterSyn } from '../shared';

const headerNcit = 'NCIt';
const headerIcdo = 'ICD-O-3';

export const tableSynonyms = (syn) => {
  return `
    <table class="table table-striped">
      ${tHead(headerNcit)}
      ${syn.s.map((s) => `
        <tr>
          <td class="table__td--term table__td--word-break">${s.termName}</td>
          <td class="table__td--source">${s.termSource}</td>
          <td class="table__td--type">${s.termGroup}</td>
        </tr>
      `.trim()).join('')}
    </table>
  `;
};

export const tableSynonymsArray = (syn) => {
  return `
    <table class="table table-striped">
      ${tHead(headerNcit)}
      ${syn.map((s) => `
        <tr>
          <td class="table__td--term table__td--word-break">${s.termName}</td>
          <td class="table__td--source">${s.termSource}</td>
          <td class="table__td--type">${s.termGroup}</td>
        </tr>
      `.trim()).join('')}
    </table>
  `;
};

export const tableAProperties = (prop) => {
  return `
    <table class="table table-striped">
      <thead>
      <tr>
        <th>Name</th>
        <th>Value</th>
      </tr>
    </thead>
      ${prop.ap.map((p) => `
        <tr>
          <td class="table__td--name">${p.name}</td>
          <td class="table__td--value table__td--word-break">${p.value}</td>
        </tr>
      `.trim()).join('')}
    </table>
  `;
};

export const tableMoreSynonyms = (syn) => {
  let previousKeyword = '';
  setTimeout(() => {
    $('#pagination-' + syn.id).pagination({
      dataSource: syn.s,
      pageSize: 15,
      showPageNumbers: false,
      showNavigator: true,
      callback: function (data, pagination) {
        let html = tableSynonymsArray(data);
        $('#data-' + syn.id).html(html);
      }
    });

    $('#drug-' + syn.id).on('input', () => {
      let keyword = $('#drug-' + syn.id).val().trim().replace(/[\ ]+/g, ' ').toLowerCase();
      if (previousKeyword === keyword) return;
      previousKeyword = keyword;
      let keywordCase = $('#drug-' + syn.id).val().trim().replace(/[\ ]+/g, ' ');
      if (keyword.length >= 3) {
        let newSyn = searchFilterSyn(syn.s, keyword);
        $('#pagination-' + syn.id).pagination({
          dataSource: newSyn,
          pageSize: 15,
          showPageNumbers: false,
          showNavigator: true,
          callback: function (data, pagination) {
            let html = tableSynonymsArray(data, keywordCase);
            $('#data-' + syn.id).html(html);
          }
        });
      } else {
        $('#pagination-' + syn.id).pagination({
          dataSource: syn.s,
          pageSize: 15,
          showPageNumbers: false,
          showNavigator: true,
          callback: function (data, pagination) {
            let html = tableSynonymsArray(data);
            $('#data-' + syn.id).html(html);
          }
        });
      }
    });
  }, 100);

  return `
    <div id="data-${syn.id}"></div>
    <div class="pagination-footer">
      <div id="pagination-${syn.id}" class="dialog__pagination"></div>
    </div>
  `;
};

export const tableIcdo3 = (value) => {
  return `
    <table class="table table-striped">
      ${tHead(headerIcdo)}
      ${value.ic_enum.map((ic) => `
        <tr>
          <td class="table__td--term table__td--word-break">${ic.n}</td>
          <td class="table__td--source">ICD-O-3</td>
          <td class="table__td--type">${ic.term_type}</td>
        </tr>
      `.trim()).join('')}
    </table>
  `;
};

const tHead = (header) => {
  return `
    <thead>
      <tr>
        <th class="table__th--term">Term</th>
        ${header === headerNcit ? `
            <th><a class="getSourceDetails" href="#">Source</a></th>
            <th><a class="getTypeDetails" href="#">Type</a></th>
          ` : `
            <th>Source</th>
            <th>Type</th>
        `}
      </tr>
    </thead>
  `;
};
