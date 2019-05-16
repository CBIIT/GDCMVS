const headerNcit = 'NCIt';
const headerIcdo = 'ICD-O-3';

export const tableSynonyms = (syn) => {
  return `
    <table class="table table-striped">
      ${tHead(headerNcit)}
      ${syn.s.map((s) => `
        <tr>
          <td class="table__td--term">${s.termName}</td>
          <td class="table__td--source">${s.termSource}</td>
          <td class="table__td--type">${s.termGroup}</td>
        </tr>
      `.trim()).join('')}
    </table>
  `;
};

export const tableIcdo3 = (value) => {
  return `
    <table class="table table-striped">
      ${tHead(headerIcdo)}
      ${value.ic_enum.map((ic) => `
        <tr>
          <td class="table__td--term">${ic.n}</td>
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
