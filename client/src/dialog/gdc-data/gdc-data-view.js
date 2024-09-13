import { tableIcdo3 } from '../../components/table';

export const headerTemplate = (target, icdo, itemsLength) => `
  <div class="gdcmvs">
    <div class="dialog__header">
      <div class="dialog__titlebar">
        <span id="ui-id-4" class="ui-dialog-title">GDC Values</span>
        <button type="button" id="close_gdc_data" class="ui-button ui-corner-all ui-widget ui-button-icon-only ui-dialog-titlebar-close" title="Close"></button>
        <span class="ui-label">${itemsLength}</span>
        ${target !== null && target !== undefined ? `
          <div class="checkbox ui-checkbox">
            <label class="checkbox__label checkbox__label--height">
              <input id="show_all_gdc_data" class="checkbox__input" type="checkbox" value="">
              <span class="checkbox__btn"><i class="checkbox__icon fa fa-check"></i></span> Show all GDC values
            </label>
          </div>
        ` : ``}
      </div>
      ${icdo !== false ? `
        <div class="table__container">
          <div class="table__thead row">
            <div class="table__th col-xs-4">GDC Term</div>
            <div class="table__th col-xs-3">ICD-O-3 Code</div>
            <div class="table__th col-xs-5">ICD-O-3 Term</div>
          </div>
        </div>
      ` : ``}
    </div>
  </div>
`;

export const bodyTemplate = (target, icdo, items) => `
  <div id="gdc_data">
    <div class="gdcmvs">
      ${icdo !== false ? `
        <div class="table__container">
          <div id="gdc-data-list" class="table__body row gdc-data-list" tabindex="0">
            <div class="col-xs-12">
              ${target !== null && target !== undefined ? `
                ${items.map((item) => `
                  ${item.n === target ? `
                    <div class="table__row row gdc-data__item--show" id="gdc_data_match">
                      <div class="table__td table__td--slim col-xs-4">${item.n}</div>
                      <div class="table__td table__td--slim col-xs-3">${item.i_c ? `${item.i_c.c}` : ``}</div>
                      <div class="table__td table__td--slim col-xs-5">
                        ${item.ic_enum !== undefined ? ` ${tableIcdo3(item)}` : ``}
                      </div>
                    </div>
                  ` : `
                    <div class="table__row row gdc-data__item--hide">
                      <div class="table__td table__td--slim col-xs-4">${item.n}</div>
                      <div class="table__td table__td--slim col-xs-3">${item.i_c ? `${item.i_c.c}` : ``}</div>
                      <div class="table__td table__td--slim col-xs-5">
                        ${item.ic_enum !== undefined ? ` ${tableIcdo3(item)}` : ``}
                      </div>
                    </div>
                  `}
                `.trim()).join('')}
              ` : `
                ${items.map((item) => `
                  <div class="table__row row">
                    <div class="table__td table__td--slim col-xs-4">${item.n}</div>
                    <div class="table__td table__td--slim col-xs-3">${item.i_c ? `${item.i_c.c}` : ``}</div>
                    <div class="table__td table__td--slim col-xs-5">
                      ${item.ic_enum !== undefined ? ` ${tableIcdo3(item)}` : ``}
                    </div>
                  </div>
                `.trim()).join('')}
              `}
            </div>
          </div>
        </div>
      ` : `
        <div class=" table__container table__container--blank">
          <div id="gdc-data-list" class="table__body row gdc-data-list" tabindex="0">
            <div class="col-xs-12">
              ${target !== null && target !== undefined ? `
                ${items.map((item) => `
                  ${item.n === target ? `
                    <div class="row gdc-data__item--show" id="gdc_data_match">
                      <div class="table__td table__td--xslim col-xs-12">${item.n}</div>
                    </div>
                  ` : `
                    <div class="row gdc-data__item--hide">
                      <div class="table__td table__td--xslim col-xs-12">${item.n}</div>
                    </div>
                  `}
                `.trim()).join('')}
              ` : `
                ${items.map((item) => `
                  <div class="row">
                    <div class="table__td table__td--xslim col-xs-12">${item.n}</div>
                  </div>
                `.trim()).join('')}
              `}
            </div>
          </div>
        </div>
      `}
    </div>
  </div>
`;
