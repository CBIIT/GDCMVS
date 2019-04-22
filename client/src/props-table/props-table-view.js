const template = (props, options) => {
  return `
    <div class="container table__container">
      <div class="table__thead row table__thead--padding-right">
        <div class="table__th col-xs-2">Category / Node</div>
        <div class="table__th col-xs-2">Property</div>
        <div class="table__th col-xs-4">Description</div>
        <div class="table__th col-xs-2">GDC Property Values</div>
        <div class="table__th col-xs-2">caDSR CDE Reference</div>
      </div>
      <div class="table__body table__body--overflow row" style="max-height: ${options.height}px;">
        <div class="col-xs-12">
        ${props.map((item) => `
          <div class="table__row row">
            <div class="table__td col-xs-2">
              <a href="https://docs.gdc.cancer.gov/Data_Dictionary/viewer/#?view=table-entity-list&anchor=${item.category === 'data_file' || item.category === 'metadata_file' ? `submittable_data_file` : `${item.category}`}" target="_blank">
                ${item.category}
              </a>
              <ul class="table__ul">
                <li class="table__li table__td--word-break">
                  <a href="https://docs.gdc.cancer.gov/Data_Dictionary/viewer/#?view=table-definition-view&id=${item.node}" target="_blank">
                    ${item.node}
                  </a>
                </li>
              </ul>
            </div>
            <div class="table__td col-xs-2 table__td--word-break">
              <a href="https://docs.gdc.cancer.gov/Data_Dictionary/viewer/#?view=table-definition-view&id=${item.node}&anchor=${item.property.replace(/<b>/g, "").replace(/<\/b>/g, "")}" target="_blank">
                ${item.property}
              </a>
            </div>
            ${item.property_desc !== undefined ? `<div class="table__td col-xs-4">${item.property_desc}</div>`: ``}
            <div class="table__td col-xs-2">
            ${item.enum !== undefined ? `
              <a class="getGDCTerms" href="#" data-ref="${item.id}">See All Values</a><br>
              <a class="toCompare" href="#" data-ref="${item.id}"> Compare with User List</a>
            ` : `
              ${item.type !== undefined ? `type: ${item.type}` : ``}
            `}
            </div>
            <div class="table__td col-xs-2">
              ${item.cdeId !== undefined ? `
                <a class="table-td-link" href="${item.cdeUrl}" target="_blank">CDE ID - ${item.cdeId}</a>
              ` : ``}
            </div>
          </div>
        `.trim()).join('')}
        </div>
      </div>
    </div>
  `;
}

export default template;
