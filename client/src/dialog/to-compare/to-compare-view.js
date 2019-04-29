import { tableSynonyms, tableIcdo3 } from '../../components/table';

export const header_template = `
  <div class="dialog__header">
    <div class="dialog__titlebar">
      <span id="ui-id-4" class="ui-dialog-title">Compare Your Values with GDC Values</span>
      <button type="button" id="close_to_compare" class="ui-button ui-corner-all ui-widget ui-button-icon-only ui-dialog-titlebar-close" title="Close"></button>

      <div class="checkbox ui-checkbox">
        <label class="checkbox__label checkbox__label--height">
          <input id="compare_filter" class="checkbox__input" type="checkbox" value="">
          <span class="checkbox__btn"><i class="checkbox__icon fa fa-check"></i></span> Partial match
        </label>
        <label class="checkbox__label checkbox__label--height">
          <input id="compare_synonyms" class="checkbox__input" type="checkbox" value="">
          <span class="checkbox__btn"><i class="checkbox__icon fa fa-check"></i></span> Synonyms
        </label>
        <label class="checkbox__label checkbox__label--height">
          <input id="compare_unmatched" class="checkbox__input" type="checkbox" value="">
          <span class="checkbox__btn"><i class="checkbox__icon fa fa-check"></i></span> Show Unmatched Values
        </label>
      </div>
      <div class="input-group dialog__input-group">
        <span id="compare-input-icon" class="input-group-addon dialog__input-addon"><i class="fa fa-search"></i></span>
        <input id="compare-input" type="text" class="form-control dialog__input" placeholder="Type at least 3 characters" aria-describedby="Search">
        <input id="compare-matched" type="text" class="form-control dialog__input" placeholder="Type at least 3 characters" aria-describedby="Search" style="display: none;">
      </div>
      <div id="compare_download" class="titlebar__container-btn" style="display: none;">
        <button id="downloadCompareCVS" class="btn btn-primary compare-form__button compare-form__button--download" aria-label="Download" title="Download">
          <i class="fa fa-download" aria-hidden="true"></i>
        </button>
      </div>
    </div>
    <div id="compare_thead" class="table__container">
      <div class="table__thead row">
        <div class="table__th col-xs-6">User Defined Values</div>
        <div class="table__th col-xs-6">Matched GDC Values</div>
      </div>
    </div>
  </div>
`
export const body_template = `
  <div id="compare_dialog" class="compare_dialog">
    <div id="compare_form" class="compare-form">
      <div id="cp_top" class="compare-form__top">
        <div id="cp_left" class="compare-form__left">
        <textarea id="cp_input" class="compare-form__textarea" rows="10" cols="20" placeholder="Input values line by line" autocomplete="off"></textarea></div>
        <div id="cp_middle" class="compare-form__middle"></div>
        <div id="cp_right" class="compare-form__right" tabindex="0" aria-label="gdc values"></div>

        <div class="compare-form__menu">
          <div id="cp_massage" class="compare-form__message"></div>
          <div class= "compare-form__pagination">
            <div id="pagination-compare" class="dialog__pagination"></div>
          </div>
        </div>
      </div>
    </div>
    <div id="compare_result" class="compare_result" style="display: none;"></div>
  </div>
`

export const footer_template = `
  <div id="cp_bottom" class="compare-form__bottom">
    <button id="compare" class="btn btn-default compare-form__button">Compare</button>
    <button id="cancelCompare" class="btn btn-default compare-form__button compare-form__button--cancel">Cancel</button>
    <div id="cp_bottom-matched" style="display: none;">
      <div class="compare-form__button-content">
        <button id="back2Compare" class="btn btn-default compare-form__button">Back</button>
      </div>
      <div class="compare-form__content-pagination">
        <div id="pagination-matched" class="dialog__pagination"></div>
      </div>
    </div>
  </div>
`

export const list_template = (items, keywordCase) => {
  return `${items.length > 0 ? `
    ${items.map((item) => `
      <div class="compare-form__values">
        <div>
          <div class="compare-form__value">${item.n}</div>
          <a class="compare-form__toggle" href="#" aria-label="expand" title="expand" aria-expanded="false">
            <i class="fa fa-plus"></i>
          </a>
        </div>
        <div class="compare-form__synm" style="display: none;">
        ${item.i_c !== undefined ? `
          <div class="compare-form__i_c">
            <div class="compare-form__ic_c">${item.i_c.c} (ICD-O-3)</div>
            <div class="compare-form__ic_enum">
              ${item.ic_enum !== undefined ? ` ${tableIcdo3(item)}`:``}
            </div>
          </div>
        `:``}
        ${item.n_syn !== undefined  ? `
          ${item.n_syn.map((n_syn) => `
            ${n_syn.s !== undefined && n_syn.s.length !== 0 ? `
              <div class="compare-form__n_syn">
                <div class="compare-form__n_c">${n_syn.n_c} (NCIt)</div>
                <div class="compare-form__s">
                  ${tableSynonyms(n_syn)}
                </div>
              </div>
            `:``}
          `.trim()).join('')}
        `:``}
        </div>
      </div>
    `.trim()).join('')}`:`
    <div  class="dialog__indicator">
      <div class="dialog__indicator-content">
        Sorry, no results found for keyword: <span class="dialog__indicator-term">${keywordCase}</span>
      </div>
    </div>
    `}`
}

export const show_compare_result = (items, option, keywordCase) => {
  return `${items.length > 0 ? `
    <div id="cp_result_table" class="table__container table__container--margin-bottom">
      <div class="table__body row">
        <div class="col-xs-12">

          ${items.map((item, i) => {
            let reg_key = new RegExp(item.match, "ig");
            return `
            ${item.match !== undefined && i !== 0 && items[i-1].match !== items[i].match ? `<div class="table__hr"></div>` : ``}
            ${item.match === undefined && i !== 0 ? `<div class="table__hr"></div>` : ``}
            <div class="row">
              <div class="table__td table__td--slim col-xs-6">
                ${item.match !== undefined && i !== 0 && items[i-1].match !== items[i].match ? item.match: ``}
                ${item.match !== undefined && i === 0 ? item.match: ``}
                ${item.match === undefined ? `<span style="color:red;">--</span>` : ``}
              </div>
              ${item.n_syn !== undefined ? `
                <div class="table__td table__gdc-match table__td--slim col-xs-6">
                  <div class="row">
                    <div class="col-xs-10">${item.n !== '' && option.partial === true ? item.n.replace(reg_key, '<b>$&</b>') :
                      `${item.n !== '' && item.n.trim().toLowerCase() === (item.match !== undefined ? item.match.trim().toLowerCase() : ``) ?  `<b>${item.n}</b>`  : `${item.n === '' ? `<span style="color:red;">--</span>` : `${item.n}`}`}` }
                    </div>
                    <div class="col-xs-2 table__right">
                      ${item.n_syn.length !== 0 ? `
                        <a href="#" class="compare-form__toggle" aria-label="expand" title="expand" aria-expanded="false"><i class="fa fa-plus"></i></a>
                      ` :``}
                    </div>
                  </div>

                  ${item.matched_s !== undefined && item.matched_s.length !== 0 ? `
                    <div class="compare-form__matched">
                      ${item.matched_s.map((match) => `
                        <div class="row table__td">
                          <div class="col-xs-3">${match.n_c} (NCIt)</div>
                          <div class="col-xs-9">
                            ${match.s !== undefined ? `
                              <table class="table table-striped">
                                <thead>
                                  <tr>
                                    <th class="table__th--term">Term</th>
                                    <th class="table__th--source"><a class="getSourceDetails" href="#">Source</a></th>
                                    <th class="table__th--type"><a class="getTypeDetails" href="#">Type</a></th>
                                  </tr>
                                </thead>

                                ${match.s.map((syn) => `
                                  <tr>
                                    <td class="table__td--term">${syn.termName.replace(reg_key, '<b>$&</b>')}</td>
                                    <td class="table__td--source">${syn.termSource !== undefined && syn.termSource !== null ? syn.termSource : ``}</td>
                                    <td class="table__td--type">${syn.termGroup !== undefined && syn.termGroup !== null ? syn.termGroup : ``}</td>
                                  </tr>
                                `.trim()).join('')}
                              </table>
                            `:``}
                          </div>
                        </div>
                      `.trim()).join('')}
                    </div>
                  `:``}

                  <div class="compare-form__synm" style="display: none;">

                    ${item.i_c !== undefined ? `
                      <div class="row table__td">
                        <div class="col-xs-3">${item.i_c.c} (ICD-O-3)</div>
                        <div class="col-xs-9">
                          <table class="table table-striped">
                            <thead>
                              <tr>
                                <th class="table__th--term">Term</th>
                                <th class="table__th--source">Source</th>
                                <th class="table__th--type">Type</th>
                              </tr>
                            </thead>
                            ${item.ic_enum.map((ic_enum) =>`
                              <tr>
                                <td class="table__td--term">${ic_enum.n}</td>
                                <td class="table__td--source">ICD-O-3</td>
                                <td class="table__td--type">${ic_enum.term_type}</td>
                              </tr>
                            `.trim()).join('')}
                          </table>
                        </div>
                      </div>
                    `:``}

                    ${item.n_syn.length !== 0 ? `
                      ${item.n_syn.map((syn) => `
                        ${syn.s !== undefined && syn.s.length !== 0 ? `
                          <div class="row table__td">
                            <div class="col-xs-3">${syn.n_c} (NCIt)</div>
                            <div class="col-xs-9">
                              ${syn.s !== undefined ? `
                                <table class="table table-striped">
                                  <thead>
                                    <tr>
                                      <th class="table__th--term">Term</th>
                                      <th class="table__th--source"><a class="getSourceDetails" href="#">Source</a></th>
                                      <th class="table__th--type"><a class="getTypeDetails" href="#">Type</a></th>
                                    </tr>
                                  </thead>

                                  ${syn.s.map((s_v) => `
                                    ${option.synonyms === false && option.partial === false ? `
                                      <tr>
                                        <td class="table__td--term">${s_v.termName}</td>
                                        <td class="table__td--source">${s_v.termSource !== undefined && s_v.termSource !== null ? s_v.termSource : ``}</td>
                                        <td class="table__td--type">${s_v.termGroup !== undefined && s_v.termGroup !== null ? s_v.termGroup : ``}</td>
                                      </tr>
                                    `:`
                                      ${option.synonyms === true && option.partial === true ? `
                                        <tr>
                                          <td class="table__td--term">${s_v.termName.replace(reg_key, '<b>$&</b>')}</td>
                                          <td class="table__td--source">${s_v.termSource !== undefined && s_v.termSource !== null ? s_v.termSource : ``}</td>
                                          <td class="table__td--type">${s_v.termGroup !== undefined && s_v.termGroup !== null ? s_v.termGroup : ``}</td>
                                        </tr>
                                      `:`
                                        ${option.synonyms === true && s_v.termName.trim().toLowerCase() === (item.match !== undefined ? item.match.trim().toLowerCase() : false) ? `
                                          <tr>
                                            <td class="table__td--term"><b>${s_v.termName}<b></td>
                                            <td class="table__td--source">${s_v.termSource !== undefined && s_v.termSource !== null ? s_v.termSource : ``}</td>
                                            <td class="table__td--type">${s_v.termGroup !== undefined && s_v.termGroup !== null ? s_v.termGroup : ``}</td>
                                          </tr>
                                        `:`
                                          <tr>
                                            <td class="table__td--term">${s_v.termName}</td>
                                            <td class="table__td--source">${s_v.termSource !== undefined && s_v.termSource !== null ? s_v.termSource : ``}</td>
                                            <td class="table__td--type">${s_v.termGroup !== undefined && s_v.termGroup !== null ? s_v.termGroup : ``}</td>
                                          </tr>
                                        `}
                                      `}
                                    `}
                                  `.trim()).join('')}
                                </table>
                              `:``}
                            </div>
                          </div>
                        `:``}
                      `.trim()).join('')}
                    `:``}
                  </div>
                </div>
              `:`
                <div class="table__td table__td--slim col-xs-6">${item.n}</div>
              `}
            </div>
            ${items.length-1 === i ? `<div class="table__hr"></div>` : ``}
          `.trim()}).join('')}
        </div>
      </div>
    </div>
  `: `
    <div  class="dialog__indicator">
      <div class="dialog__indicator-content">
        Sorry, no results found for keyword: <span class="dialog__indicator-term">${keywordCase}</span>
      </div>
    </div>
  `}`
}
