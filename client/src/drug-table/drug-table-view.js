import { tableSynonyms, tableMoreSynonyms, tableIcdo3 } from '../components/table';

const template = (values, options) => {
  return `
  <div class="container table__container">
    <div class="table__thead row">
      <div class="col-xs-3">
        <div class="table__th">Category / Node / Property</div>
      </div>
      <div class="col-xs-9">
        <div class="table__thead row">
          <div class="table__th col-xs-12">Matched GDC Values
            <a class="table__tooltip tooltip-target" data-toggle="tooltip" data-placement="bottom" data-trigger="hover"
              title="Values that are found in the GDC dictionary and may be successfully submitted for the corresponding property.">
              <i class="fa fa-info-circle"></i>
            </a>
          </div>
        </div>
      </div>
    </div>
    <div id="table-body" class="table__body table__body--overflow row" style="max-height: ${options.height}px;">
      <div class="col-xs-12">
        ${values.map((item) => `
          <div class="table__row row table__row--striped table__row--flex">
          <div class="table__td col-xs-3">${item.category}
            <ul class="table__ul">
              <li class="table__li table__td--word-break">${item.node}
                <ul class="table__ul">
                  <li class="table__li table__td--word-break">${item.property}</li>
                </ul>
              </li>
            </ul>
            <a href="#" class="gdc-details" aria-expanded="false">
              <i class="fa fa-caret-down"></i> detail</a>
            <div class="gdc-links" style="display: none;">
              <a class="getGDCTerms" href="#" data-ref="${item.id}">See All Values</a></br>
              <a class="toCompare" href="#" data-ref="${item.id}"> Compare with User List</a></br>
              ${item.cdeId !== '' ? `
                <span>caDSR:</span>
                <a href="${item.cdeUrl}" target="_blank">CDE</a>
              ` : ``}
            </div>
          </div>
          <div class="table__values col-xs-9">
            ${item.vs.map((value, index) => `
              ${index === 5 ? `<div class="table__row--toggle">` : ``}
              <div class="row table__row--flex">
                <div class="table__td table__gdc-values col-xs-12">
                  <div class="row">
                    <div class="col-xs-10">
                      <a class="getGDCData" href="#" data-ref="${item.id}" data-tgt="${value.n}" data-keyword="${options.keyword}">${value.n}</a>
                    </div>
                    <div class="col-xs-2 table__right">
                      ${value.n_syn !== undefined || value.ic_enum !== undefined ? `
                      <a href="#" class="table__toggle" aria-label="expand" title="expand" aria-expanded="false">
                        <i class="fa fa-plus"></i>
                      </a>
                      ` : ``}
                    </div>
                  </div>
                  <div class="data-content" style="display: none;">

                    ${value.synLen >= 25 ? `
                    <div class="row table__search-container">
                      <div class="col-xs-12 table__right">
                        <div class="input-group dialog__input-group">
                          <span class="input-group-addon dialog__input-addon"><i class="fa fa-search"></i></span>
                          <input id="drug-${item.property}-${value.src_n}" type="text" class="form-control dialog__input" placeholder="Type at least 3 characters" aria-describedby="Search">
                        </div>
                      </div>
                    </div>
                    ` : ``}

                    ${value.ic_enum !== undefined ? `
                      <div class="row table__td">
                        <div class="col-xs-3">${value.i_c.c} (ICD-O-3)</div>
                        <div class="col-xs-9">
                          ${tableIcdo3(value)}
                        </div>
                      </div>
                    ` : ``}

                    ${value.n_syn !== undefined ? `
                      ${value.n_syn.map((syn) => `
                        <div class="row table__td">
                          <div class="col-xs-3">
                            <a class="getNCITDetails" href="#" data-uid="${syn.n_c}">${syn.n_c}</a> (NCIt)
                          </div>
                          <div class="col-xs-9">
                            ${value.synLen >= 25 ? `
                              ${tableMoreSynonyms(syn, item.property, value.src_n, syn.n_c)}
                            ` : `
                              ${tableSynonyms(syn)}
                            `}
                          </div>
                        </div>
                      `.trim()).join('')}
                    ` : ``}
                  </div>
                </div>
              </div>
            `.trim()).join('')}
            ${item.vs.length > 5 ? `
              </div>
              <div class="row">
                <div class="table__td col-xs-12">
                  <a href="#" class="table-td-link show-more-less" aria-expanded="false" data-hidden="${item.vs.length - 5}">
                    <i class="fa fa-angle-down"></i> Show More (${item.vs.length - 5})</a>
                </div>
              </div>
            ` : ``}
          </div>
        </div>
        `.trim()).join('')}
      </div>
    </div>
  </div>
  `;
};

export default template;