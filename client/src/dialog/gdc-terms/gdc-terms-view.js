import { tableSynonyms, tableIcdo3 } from '../../components/table';

export const headerTemplate = (targetsLength, icdo, itemsLength) => `
<div class="dialog__header">
  <div class="dialog__titlebar">
    <span id="ui-id-4" class="ui-dialog-title">GDC Values</span>
    <button type="button" id="close_gdc_terms_data" class="ui-button ui-corner-all ui-widget ui-button-icon-only ui-dialog-titlebar-close" title="Close"></button>
    <span class="ui-label">${itemsLength}</span>
    <div class="checkbox ui-checkbox">
      ${targetsLength !== 0 ? `
        <label class="checkbox__label checkbox__label--height">
          <input id="show_all_gdc_syn" class="checkbox__input" type="checkbox" value="">
          <span class="checkbox__btn"><i class="checkbox__icon fa fa-check"></i></span> Show all GDC values
        </label>
      ` : ``}
    </div>
    <div class="input-group dialog__input-group">
      <span id="gdc-values-icon" class="input-group-text"><i class="fa fa-search"></i></span>
      <input id="gdc-values-input"  type="text" class="form-control dialog__input" placeholder="Type at least 3 characters" aria-describedby="Search">
    </div>
  </div>
  <div class="table__container">
    <div class="table__thead row">
      ${icdo === true ? `
        <div class="table__th col-2">GDC Value</div>
        <div class="table__th col-2">ICD-O-3 Code</div>
        <div class="table__th col-3">ICD-O-3 Term</div>
        <div class="col-5">
          <div class="row">
            <div class="table__th col-4">NCIt Code</div>
            <div class="table__th col-8">NCIt Terms</div>
          </div>
        </div>
      ` : `
        <div class="table__th col-5">GDC Value</div>
        <div class="col-7">
          <div class="row">
            <div class="table__th col-4">NCIt Code</div>
            <div class="table__th col-8">NCIt Terms</div>
          </div>
        </div>
      `}
    </div>
  </div>
</div>
`;

export const listTemplate = (items, icdo, keywordCase) => {
  return `${items.length !== 0 ? `
    <div id="gdc-syn-data-list" class="table__container">
      <div class="table__body row">
        <div id="gdc-syn-container" class="col-12">
          ${items.map((item, i) => `
          <div id="gdc_term_item" class="table__row row gdc-term__item--show">
            ${icdo ? `
              <div class="table__td col-2">${item.n}</div>
              <div class="table__td col-2">${item.i_c ? `${item.i_c.c}` : ``}</div>
              <div class="table__td col-3">
                ${item.ic_enum !== undefined ? ` ${tableIcdo3(item)}` : ``}
              </div>
              <div class="col-5">

              ${item.n_syn !== undefined ? `
                ${item.n_syn.map((nSyn) => `
                <div class="row">
                  <div class="table__td col-4">
                    ${nSyn.n_c !== undefined && nSyn.n_c !== '' ? `<a class="getNCITDetails" href="#" data-uid="${nSyn.n_c}">${nSyn.n_c}</a>` : ``}
                  </div>
                  <div name="syn_area" class="table__td col-8">
                    ${tableSynonyms(nSyn)}
                  </div>
                </div>
                `.trim()).join('')}
              ` : ``}

              </div>
            ` : `
              <div class="table__td col-5">${item.n}</div>
              <div class="col-7">

                ${item.n_syn !== undefined ? `
                  ${item.n_syn.map((nSyn) => `
                    <div class="row">
                      <div class="table__td col-4">
                        ${nSyn.n_c !== undefined && nSyn.n_c !== '' ? `<a class="getNCITDetails" href="#" data-uid="${nSyn.n_c}">${nSyn.n_c}</a>` : ``}
                      </div>
                      <div name="syn_area" class="table__td col-8">
                      ${tableSynonyms(nSyn)}
                      </div>
                    </div>
                  `.trim()).join('')}
                ` : ``}

              </div>
            `}
          </div>`.trim()).join('')}
        </div>
      </div>
    </div>
  ` : `
    <div  class="dialog__indicator">
      <div class="dialog__indicator-content">
        Sorry, no results found for keyword: <span class="dialog__indicator-term">${keywordCase}</span>
      </div>
    </div>
  `} `;
};

export const footerTemplate = `
<div class="dialog__footer">
  <div id="pagination-container" class="dialog__pagination"></div>
</div>
`;
