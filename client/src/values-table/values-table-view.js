import { tableSynonyms, tableMoreSynonyms, tableAdditionalProperties, tableIcdo3 } from '../components/table';

const template = (values, options) => {
  return `
    <template-values-table>
      <div class="container table__container">
        <div class="table__thead row">
          <div class="col-3">
            <div class="table__th">Category / Node / Property</div>
          </div>
          <div class="col-9">
            <div class="table__thead row">
              <div class="table__th col-12">Matched GDC Values
                <a class="table__tooltip tooltip-target" data-bs-toggle="tooltip" data-placement="bottom" data-trigger="hover"
                  title="Values that are found in the GDC dictionary and may be successfully submitted for the corresponding property.">
                  <i class="fa fa-info-circle"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
        <div id="table-body" class="table__body table__body--overflow row" style="max-height: ${options.height}px;">
          <div class="col-12">
            ${values.map((item) => `
              <div class="table__row row table__row--striped table__row--flex">
              <div class="table__td col-3">${item.category}
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
                </div>
              </div>
              <div class="table__values col-9">
                ${item.vs.map((value, index) => `
                  ${index === 5 ? `<div class="table__row--toggle">` : ``}
                  <div class="row table__row--flex">
                    <div class="table__td table__gdc-values col-12">
                      <div class="row">
                        <div class="col-10">
                          <a class="getGDCData" href="#" data-ref="${item.id}" data-tgt="${value.n}" data-keyword="${options.keyword}">${value.n}</a>
                        </div>
                        <div class="col-2 table__right">
                          ${value.n_syn !== undefined || value.ic_enum !== undefined ? `
                          <a href="#" class="table__toggle" aria-label="expand" title="expand" aria-expanded="false">
                            <i class="fa fa-plus"></i>
                          </a>
                          ` : ``}
                        </div>
                      </div>
                      <div class="data-content" style="display: none;">


                      ${value.n_syn !== undefined || value.ic_enum !== undefined ? `

                          <div class="row table__td table__td--top">
                            <div class="col-12">
                              <ul class="nav nav-tabs nav-tabs-gdc" role="tablist">

                              ${value.ic_enum !== undefined && value.n_syn !== undefined ? `
                                <li role="presentation" class="active">
                                  <a href="#tab-${value.i_c.id}" aria-controls="${value.i_c.c}" role="tab" data-toggle="tab">
                                    ${`${value.i_c.c} (ICD-O-3)`.substring(0, 34)}
                                  </a>
                                </li>
                              ` : ``}

                              ${(value.n_syn !== undefined && value.n_syn.length !== 0 && value.ic_enum !== undefined) || (value.n_syn !== undefined && value.n_syn.length > 1 && value.ic_enum === undefined) ? `

                                ${value.n_syn.map((syn, i) => `
                                  <li role="presentation" class="${value.ic_enum === undefined && i === 0 ? `active` : ``}">
                                    <a href="#tab-${syn.id}" aria-controls="${syn.n_c}" role="tab" data-toggle="tab">
                                      ${`${syn.n_c} (NCIt) ${syn.pt !== undefined ? `${syn.pt}` : ``}`.substring(0, 34)}${`${syn.n_c} (NCIt) ${syn.pt !== undefined ? `${syn.pt}` : ``}`.length >= 34 ? `...` : ``}
                                    </a>
                                  </li>
                                `.trim()).join('')}

                              ` : ``}

                              </ul>
                            </div>
                          </div>

                        <div class="tab-content">

                          ${value.ic_enum !== undefined ? `
                            <div role="tabpanel" class="tab-pane tab-pane-gdc active" id="tab-${value.i_c.id}">
                              <div class="row table__td">
                                <div class="col-12">${value.i_c.c} (ICD-O-3)</div>
                              </div>
                              <div class="row table__td table__td--bottom">
                                <div class="col-12">
                                  ${tableIcdo3(value)}
                                </div>
                              </div>
                            </div>
                          ` : ``}

                          ${value.n_syn !== undefined && value.n_syn.length !== 0 ? `

                            ${value.n_syn.map((syn, i) => `
                              <div role="tabpanel" class="tab-pane tab-pane-gdc${value.ic_enum === undefined && i === 0 ? ` active` : ``}" id="tab-${syn.id}">
                                <div class="row table__td">
                                  <div class="col-12">
                                    <b>NCI Thesaurus Code: </b><a class="getNCITDetails" href="#" data-uid="${syn.n_c}">${syn.n_c}</a>
                                  </div>
                                </div>

                                ${value.drug === true && syn.def !== undefined ? `
                                  <div class="row table__td">
                                    <div class="col-12">
                                      <b>Definition: </b>${syn.def}
                                    </div>
                                  </div>
                                ` : ``}

                                <div class="row table__td">
                                  <div class="col-4">
                                    <b>Synonyms &amp; Abbreviations:</b>
                                  </div>
                                  ${syn.s.length >= 25 ? `
                                  <div class="col-8 table__right">
                                    <div class="input-group dialog__input-group">
                                      <span class="input-group-addon dialog__input-addon"><i class="fa fa-search"></i></span>
                                      <input id="drug-${syn.id}" type="text" class="form-control dialog__input" placeholder="Type at least 3 characters" aria-describedby="Search">
                                    </div>
                                  </div>
                                ` : ``}
                                </div>

                                <div class="row table__td table__td--bottom">
                                  <div class="col-12">
                                    ${syn.s.length >= 25 ? `
                                      ${tableMoreSynonyms(syn)}
                                    ` : `
                                      ${tableSynonyms(syn)}
                                    `}
                                  </div>
                                </div>

                                ${value.drug === true && syn.ap !== undefined && syn.ap.length !== 0 ? `
                                  <div class="row table__td table__td">
                                    <div class="col-12">
                                      <b>Additional Attributes:</b>
                                    </div>
                                  </div>
                                  <div class="row table__td table__td--bottom">
                                    <div class="col-12">
                                      ${tableAdditionalProperties(syn)}
                                    </div>
                                  </div>
                                ` : ``}
                              </div>
                            `.trim()).join('')}

                          ` : ``}

                        </div>
                      ` : ``}
                      </div>
                    </div>
                  </div>
                `.trim()).join('')}
                ${item.vs.length > 5 ? `
                  </div>
                  <div class="row">
                    <div class="table__td col-12">
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
    </template-values-table>
  `;
};

export default template;
