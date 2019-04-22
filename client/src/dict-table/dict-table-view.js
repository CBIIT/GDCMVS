const template = (dictionary, options) => {
  return `
    <div class="container table__container">
      <div class="table__thead row">
        <div class="col-xs-4">
          <div class="table__th">Name</div>
        </div>
        <div class="col-xs-4">
          <div class="table__th">Description</div>
        </div>
        <div class="col-xs-4">
          <div class="table__th table__th--right">
            <div class="checkbox checkbox-th">
              <label class="checkbox__label">
                <input class="checkbox__input" id="trs-checkbox" type="checkbox" value="">
                <span class="checkbox__btn">
                  <i class="checkbox__icon fa fa-check"></i>
                </span> Show all values
              </label>
            </div>
            <button type="button" id="trs_toggle" class="btn btn-th" data-toggle="button" aria-pressed="false" autocomplete="off">
              <i class="btn-th__icon fa fa-angle-down"></i> Expand All
            </button>
          </div>
        </div>
      </div>
      <div class="table__body table__body--overflow row" style="max-height: ${options.height}px;">
        <div class="col-xs-12">
          <ul id="treeview" class="treeview">
            ${dictionary.map((category) => `
              <li class="treeview__${category.type} treeview__parent">
                <div class="treeview__row row">
                  <div class="treeview__col col-xs-4">
                    <span class="treeview__indenter">
                      <a href="#" class="treeview__toggle" aria-label="expand">
                        <i class="fa fa-angle-down"></i>
                      </a>
                    </span>
                    <a href="https://docs.gdc.cancer.gov/Data_Dictionary/viewer/#?view=table-entity-list&anchor=${category.category === 'data_file' || category.category === 'metadata_file' ? `submittable_data_file` : `${category.category}`}" target="_blank">
                      ${category.category} ${category.length !== undefined ? `(${category.length})` : ``}
                    </a>
                  </div>
                  <div class="treeview__col col-xs-8"></div>
                </div>
                <ul class="treeview__ul">
                  ${category.nodes.map((node) => `
                    <li class="treeview__${node.type} treeview__parent">
                      <div class="treeview__row row">
                        <div class="treeview__col col-xs-4">
                          <span class="treeview__indenter">
                            <a href="#" class="treeview__toggle" aria-label="expand">
                              <i class="fa fa-angle-down"></i>
                            </a>
                          </span>
                          <a href="https://docs.gdc.cancer.gov/Data_Dictionary/viewer/#?view=table-definition-view&id=${node.node}" target="_blank">
                            ${node.node} ${node.length !== undefined ? `(${node.length})` : ``}
                          </a>
                        </div>
                        <div class="treeview__col col-xs-8">${node.node_desc}</div>
                      </div>
                      <ul class="treeview__ul">
                      ${node.properties.map((property) => `
                        <li class="treeview__${property.type} treeview__parent">
                          <div class="treeview__row row">
                            <div class="treeview__col col-xs-4">
                              <span class="treeview__indenter">
                                ${property.hl_values.length !== 0 || property.all_values.length !== 0 ? `
                                  <a href="#" class="treeview__toggle" aria-label="expand">
                                    <i class="fa fa-angle-down"></i>
                                  </a>
                                `: ``}
                              </span>
                              <a href="https://docs.gdc.cancer.gov/Data_Dictionary/viewer/#?view=table-definition-view&id=${node.node}&anchor=${property.property.replace(/<b>/g, "").replace(/<\/b>/g, "")}" target="_blank">
                                ${property.property} ${property.length !== undefined ? `(${property.length})` : ``}
                              </a>
                            </div>
                            <div class="treeview__col col-xs-8">${property.property_desc}</div>
                          </div>
                          <ul class="treeview__ul treeview__ul--hl">
                          ${property.hl_values.length !== 0 ? `
                            ${property.hl_values.map((value) => `
                              <li class="treeview__value">
                                <div class="treeview__row row">
                                  <div class="treeview__col col-xs-4">${value}</div>
                                  <div class="treeview__col col-xs-8"></div>
                                </div>
                              </li>
                            `.trim()).join('')}
                          ` : ``}
                          </ul>
                          <ul class="treeview__ul--all">
                          ${property.all_values.length !== 0 ? `
                            ${property.all_values.map((value) => `
                              <li class="treeview__value">
                                <div class="treeview__row row">
                                  <div class="treeview__col col-xs-4">${value}</div>
                                  <div class="treeview__col col-xs-8"></div>
                                </div>
                              </li>
                            `.trim()).join('')}
                          ` : ``}
                          </ul>
                        </li>
                      `.trim()).join('')}
                      </ul>
                    </li>
                  `.trim()).join('')}
                </ul>
              </li>
            `.trim()).join('')}
          </ul>
        </div>
      </div>
    </div>
  `;
}

export default template;
