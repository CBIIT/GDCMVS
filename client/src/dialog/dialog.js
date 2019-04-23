import gdcData from './gdc-data/gdc-data';
import toCompare from './to-compare/to-compare';
import GDCTerms from './gdc-terms/gdc-terms';
import getNCITDetails from './ncit-details/ncit-details'
import sourceDetails from './source-details/source-details';
import typeDetails from './type-details/type-details';

export const dialogEvents = ($root, $body) => {
  $root.on('click', '.getGDCData', (event) => {
    event.preventDefault();
    let data = event.currentTarget.dataset;
    let uid = data.ref;
    gdcData(uid, data.tgt, data.keyword);
  });

  $root.on('click', '.toCompare', (event) => {
    event.preventDefault();
    let data = event.currentTarget.dataset;
    let uid = data.ref;
    toCompare(uid);
  });

  $root.on('click', '.getGDCTerms', (event) => {
    event.preventDefault();
    let data = event.currentTarget.dataset;
    let uid = data.ref;
    GDCTerms(uid, data.targets);
  });

  $body.on('click', '.getNCITDetails', (event) => {
    event.preventDefault();
    let data = event.currentTarget.dataset;
    getNCITDetails(data.uid);
  });

  $body.on('click', '.getSourceDetails', (event) => {
    event.preventDefault();
    sourceDetails();
  });

  $body.on('click', '.getTypeDetails', (event) => {
    event.preventDefault();
    typeDetails();
  });

  $body.on('click', '.compare-form__toggle', (event) => {
    event.preventDefault();
    const $this = $(event.currentTarget);
    const $target = $this.closest('.compare-form__values, .table__gdc-match').find('.compare-form__synm');
    const $matched = $this.closest('.compare-form__values, .table__gdc-match').find('.compare-form__matched');
    $matched.slideToggle(350);
    $target.slideToggle(350, () => {
      if ($target.is(":visible")) {
        $this.attr('title', 'collapse');
        $this.attr('aria-label', 'collapse');
        $this.attr('aria-expanded', 'true');
        $this.html('<i class="fa fa-minus"></i>');
      } else {
        $this.attr('title', 'expand');
        $this.attr('aria-label', 'expand');
        $this.attr('aria-expanded', 'false');
        $this.html('<i class="fa fa-plus"></i>');
      }
    });
  });
}

const compareGDCvalues = (fromV, toV, option) => {
  toV = JSON.parse(JSON.stringify(toV));
  let v_lowercase = [], v_matched = [];
  toV.forEach(function (v) {
    v_lowercase.push(v.n.trim().toLowerCase());
    if(v.s && v.s.length > 0) v.s = v.s.map(function(x){ return {termName: x.termName.toLowerCase(), termSource: x.termSource, termGroup: x.termGroup}; });
    if(v.all_syn && v.all_syn.length > 0) v.all_syn = v.all_syn.map(function(x){ return x.toLowerCase(); });
  });

  let items = [];
  fromV.forEach(function (v) {
    let caseSensitiveV = v.trim().replace(/[\ ]+/g, " ");
    v = v.trim().toLowerCase().replace(/[\ ]+/g, " ");
    let reg_key = new RegExp(v, "ig");
    let tmp = v;
    if (tmp === '') {
      return;
    }
    let text = [];
    if (option.partial === false) { // If exact match is checked
      let checker_n = [];
      let idx = v_lowercase.indexOf(tmp);
      if (idx >= 0) {
        toV[idx].match = caseSensitiveV;
        text.push(toV[idx]);
        checker_n.push(toV[idx].n);
        v_matched.push(idx);
      }
      if(option.synonyms === true){
        toV.forEach((em, i) => {
          if (em.all_syn) { // If it's a ICDO3 code it will have all_syn
            if (em.all_syn.indexOf(tmp) !== -1 && checker_n.indexOf(toV[i].n) === -1) {
              text.push(toV[i])
              checker_n.push(toV[i].n);
              v_matched.push(i);
            }
          }
          if (em.s) {
            em.s.forEach(s => {
              if (s.termName.trim().toLowerCase() === tmp && checker_n.indexOf(toV[i].n) === -1) {
                text.push(toV[i]);
                checker_n.push(toV[i].n);
                v_matched.push(i);
              }
            });
          }
        });
        let checker_n_c = getMatchedSynonyms(text, tmp, option);
        text.forEach(em => {
          em.match = caseSensitiveV;
          if(em.n_syn !== undefined && em.s === undefined){
            em.n_syn.forEach(n_s => {
              if(em.matched_s === undefined && checker_n_c[n_s.n_c] !== undefined){
                em.matched_s = [];
                em.chk_n_c = [];
                em.chk_n_c.push(n_s.n_c);
                em.matched_s.push({n_c: n_s.n_c, s: checker_n_c[n_s.n_c]});
              }
              else if(em.matched_s !== undefined && em.chk_n_c.indexOf(n_s.n_c) === -1 && checker_n_c[n_s.n_c] !== undefined){
                let tmp_obj = {};
                tmp_obj.n_c = n_s.n_c;
                tmp_obj.s = checker_n_c[n_s.n_c];
                em.matched_s.push(tmp_obj);
                em.chk_n_c.push(n_s.n_c);
              }
            });
          }
          else if(em.s !== undefined && em.n_syn === undefined && checker_n_c[em.n_c] !== undefined){
            if(em.matched_s === undefined){
              em.matched_s = [];
              em.chk_n_c = [];
              em.chk_n_c.push(em.n_c);
              em.matched_s.push({n_c: em.n_c, s: checker_n_c[em.n_c]});
            }
            else if(em.matched_s !== undefined && em.chk_n_c.indexOf(em.n_c) === -1 && checker_n_c[em.n_c] !== undefined){
              let tmp_obj = {};
              tmp_obj.n_c = em.n_c;
              tmp_obj.s = checker_n_c[em.n_c];
              em.matched_s.push(tmp_obj);
              em.chk_n_c.push(em.n_c);
            }
          }
        });
      }
    } else { // If it's partial match
      let checker_n = [];
      v_lowercase.forEach((v_tmp, index) => {
        let idx = v_tmp.indexOf(tmp);
        if (idx >= 0 && checker_n.indexOf(toV[index].n) === -1) {
          toV[index].match = caseSensitiveV;
          text.push(toV[index]);
          checker_n.push(toV[index].n);
          v_matched.push(index);
        }
        if(option.synonyms === true){
          toV.forEach((em, i) => {
            if (em.all_syn) {
              em.all_syn.forEach(syn => { // If it's a ICDO3 code it will have all_syn
                if (syn.indexOf(tmp) !== -1 && checker_n.indexOf(toV[i].n) === -1) {
                  text.push(toV[i]);
                  checker_n.push(toV[i].n);
                  v_matched.push(i);
                }
              });
            }
            if (em.s) {
              em.s.forEach(syn => {
                if (syn.termName.indexOf(tmp) !== -1 && checker_n.indexOf(toV[i].n) === -1) {
                  text.push(toV[i]);
                  checker_n.push(toV[i].n);
                  v_matched.push(i);
                }
              });
            }
          });
          let checker_n_c = getMatchedSynonyms(text, tmp, option);
          text.forEach(em => {
            em.match = caseSensitiveV;
            if(em.n_syn !== undefined && em.s === undefined){
              em.n_syn.forEach(n_s => {
                if(em.matched_s === undefined && checker_n_c[n_s.n_c] !== undefined){
                  em.matched_s = [];
                  em.chk_n_c = [];
                  em.chk_n_c.push(n_s.n_c);
                  em.matched_s.push({n_c: n_s.n_c, s: checker_n_c[n_s.n_c]});
                }
                else if(em.matched_s !== undefined && em.chk_n_c.indexOf(n_s.n_c) === -1 && checker_n_c[n_s.n_c] !== undefined){
                  let tmp_obj = {};
                  tmp_obj.n_c = n_s.n_c;
                  tmp_obj.s = checker_n_c[n_s.n_c];
                  em.matched_s.push(tmp_obj);
                  em.chk_n_c.push(n_s.n_c);
                }
              });
            }
            else if(em.s !== undefined && em.n_syn === undefined && checker_n_c[em.n_c] !== undefined){
              if(em.matched_s === undefined){
                em.matched_s = [];
                em.chk_n_c = [];
                em.chk_n_c.push(em.n_c);
                em.matched_s.push({n_c: em.n_c, s: checker_n_c[em.n_c]});
              }
              else if(em.matched_s !== undefined && em.chk_n_c.indexOf(em.n_c) === -1 && checker_n_c[em.n_c] !== undefined){
                let tmp_obj = {};
                tmp_obj.n_c = em.n_c;
                tmp_obj.s = checker_n_c[em.n_c];
                em.matched_s.push(tmp_obj);
                em.chk_n_c.push(em.n_c);
              }
            }
          });
        }
      })
    }
    if(text.length > 0) text.sort((a, b) => (a.n.toLowerCase() > b.n.toLowerCase()) ? 1 : ((b.n.toLowerCase() > a.n.toLowerCase()) ? -1 : 0));
    if(text.length === 0) text.push({n: '', n_c: '', match: caseSensitiveV, s: []});
    items = items.concat(JSON.parse(JSON.stringify(text)));
  });

  items = option.unmatched ? items.concat(toV.filter((v,i) => !v_matched.includes(i))) : items;
  return items;
}


export const showCompareResult = (items, option, keywordCase) => {
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
              `:``}

              ${item.s !== undefined ? `
                <div class="table__td table__gdc-match table__td--slim col-xs-6">
                  <div class="row">
                    <div class="col-xs-10">${item.n !== '' && option.partial === true ? item.n.replace(reg_key, '<b>$&</b>') :
                      `${item.n !== '' && item.n.trim().toLowerCase() === (item.match !== undefined ? item.match.trim().toLowerCase() : ``) ?  `<b>${item.n}</b>`  : `${item.n === '' ? `<span style="color:red;">--</span>` : `${item.n}`}`}` }
                    </div>
                    <div class="col-xs-2 table__right">
                      ${item.s.length !== 0 ? `
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

                  ${item.s.length !== 0 ? `
                    <div class="compare-form__synm" style="display: none;">

                      ${item.s !== undefined && item.s.length !== 0 ? `
                        <div class="row table__td">
                          <div class="col-xs-3">${item.n_c} (NCIt)</div>
                          <div class="col-xs-9">
                            ${item.s !== undefined ? `
                              <table class="table table-striped">
                                <thead>
                                  <tr>
                                    <th class="table__th--term">Term</th>
                                    <th class="table__th--source"><a class="getSourceDetails" href="#">Source</a></th>
                                    <th class="table__th--type"><a class="getTypeDetails" href="#">Type</a></th>
                                  </tr>
                                </thead>

                                ${item.s.map((syn) => `
                                  ${option.synonyms === false && option.partial === false ? `
                                    <tr>
                                      <td class="table__td--term">${syn.termName}</td>
                                      <td class="table__td--source">${syn.termSource !== undefined && syn.termSource !== null ? syn.termSource : ``}</td>
                                      <td class="table__td--type">${syn.termGroup !== undefined && syn.termGroup !== null ? syn.termGroup : ``}</td>
                                    </tr>
                                  `:`
                                    ${option.synonyms === true && option.partial === true ? `
                                      <tr>
                                        <td class="table__td--term">${syn.termName.replace(reg_key, '<b>$&</b>')}</td>
                                        <td class="table__td--source">${syn.termSource !== undefined && syn.termSource !== null ? syn.termSource : ``}</td>
                                        <td class="table__td--type">${syn.termGroup !== undefined && syn.termGroup !== null ? syn.termGroup : ``}</td>
                                      </tr>
                                    `:`
                                      ${option.synonyms === true && syn.termName.trim().toLowerCase() === (item.match !== undefined ? item.match.trim().toLowerCase() : false) ? `
                                        <tr>
                                          <td class="table__td--term"><b>${syn.termName}<b></td>
                                          <td class="table__td--source">${syn.termSource !== undefined && syn.termSource !== null ? syn.termSource : ``}</td>
                                          <td class="table__td--type">${syn.termGroup !== undefined && syn.termGroup !== null ? syn.termGroup : ``}</td>
                                        </tr>
                                      `:`
                                        <tr>
                                          <td class="table__td--term">${syn.termName}</td>
                                          <td class="table__td--source">${syn.termSource !== undefined && syn.termSource !== null ? syn.termSource : ``}</td>
                                          <td class="table__td--type">${syn.termGroup !== undefined && syn.termGroup !== null ? syn.termGroup : ``}</td>
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
                    </div>
                  `:``}
                </div>
              `:``}
              ${item.s === undefined && item.n_syn === undefined ? `
                <div class="table__td table__td--slim col-xs-6">${item.n}</div>
              `:``}
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

const getMatchedSynonyms = (text, tmp, option) => {
  if(option.partial === false){
    let checker_n_c = {};
    text.forEach(em => {
      if(em.matched_s) em.matched_s = undefined; // remove matched_s from previous tmp
      if(em.n_syn !== undefined && em.s === undefined){
        em.n_syn.forEach(n_s => {
          if(n_s.s === undefined) return;
          n_s.s.forEach(x => {
            if(x.termName.trim().toLowerCase() === tmp){
              if(checker_n_c[n_s.n_c] === undefined ){
                checker_n_c[n_s.n_c] = [];
                checker_n_c[n_s.n_c].push(x);
              }
              else if(checker_n_c[n_s.n_c] !== undefined && !_.some(checker_n_c[n_s.n_c], x)){
                checker_n_c[n_s.n_c].push(x);
              }
            }
          });
        });
      }
      else if(em.s !== undefined && em.n_syn === undefined){
        em.s.forEach(x => {
          if(x.termName.trim().toLowerCase() === tmp){
            if(checker_n_c[em.n_c] === undefined ){
              checker_n_c[em.n_c] = [];
              checker_n_c[em.n_c].push(x);
            }
            else if(checker_n_c[em.n_c] !== undefined && !_.some(checker_n_c[em.n_c], x)){
              checker_n_c[em.n_c].push(x);
            }
          }
        });
      }
    });
    return checker_n_c;
  }
  else{
    let checker_n_c = {};
    text.forEach(em => {
      if(em.matched_s) em.matched_s = undefined; // remove matched_s from previous tmp
      if(em.n_syn !== undefined && em.s === undefined){
        em.n_syn.forEach(n_s => {
          if(n_s.s === undefined) return;
          n_s.s = n_s.s.map(x => {return {termName: x.termName.toLowerCase(), termGroup: x.termGroup, termSource: x.termSource}});
          n_s.s.forEach(tmp_s => {
            let s_idx = tmp_s.termName.indexOf(tmp);
            if(s_idx >= 0){
              if(checker_n_c[n_s.n_c] === undefined ){
                checker_n_c[n_s.n_c] = [];
                checker_n_c[n_s.n_c].push(tmp_s);
              }
              else if(checker_n_c[n_s.n_c] !== undefined && !_.some(checker_n_c[n_s.n_c], tmp_s)){
                checker_n_c[n_s.n_c].push(tmp_s);
              }
            }
          });
        });
      }
      else if(em.s !== undefined && em.n_syn === undefined){
        em.s = em.s.map(x => { return {termName: x.termName.toLowerCase(), termGroup: x.termGroup, termSource: x.termSource}});
        em.s.forEach(tmp_s => {
          let s_idx = tmp_s.termName.indexOf(tmp);
          if(s_idx >= 0){
            if(checker_n_c[em.n_c] === undefined ){
              checker_n_c[em.n_c] = [];
              checker_n_c[em.n_c].push(tmp_s);
            }
            else if(checker_n_c[em.n_c] !== undefined && !_.some(checker_n_c[em.n_c], tmp_s)){
              checker_n_c[em.n_c].push(tmp_s);
            }
          }
        });
      }
    });
    return checker_n_c;
  }
}

const downloadCompareCVS = (items) => {
  let csv = 'User Defined Values, Matched GDC Values, ICDO3 code, NCIt code, ICDO3 Strings/Synonyms,\n';
  items.forEach((item, i) => {
    let new_line = true;
    let match = item.match;
    if (item.match !== undefined && i !== 0 && items[i-1].match === items[i].match) match = "";
    if (item.match === undefined) match = "--";
    csv +='"' + match + '","' + item.n + '",';
    csv += item.i_c !== undefined ? '"' + item.i_c.c + '",': '"",';
    if(item.ic_enum){
      item.ic_enum.forEach((icenum, i) => {
        csv += i === 0 ? '"","' + icenum.n + '",':'"' + icenum.n + '",';
      })
    }

    if (item.n_syn) {
      if (item.n_syn.length !== 0) {
        item.n_syn.forEach(function(syn, tmp_index) {
          if (syn.s.length !== 0) {
            csv += tmp_index === 0 ? '\n"","","","' + syn.n_c + '",':'"","","","' + syn.n_c + '",';
            syn.s.forEach(function (s_v) {
              csv += '"' + s_v.termName + '",';
            });
            csv += '\n';
            new_line = false;
          }
        });
      }
    }

    if (item.s) {
      if (item.s.length !== 0) {
        csv +='"' + item.n_c + '",';
        item.s.forEach(function (s_v) {
          csv += '"' + s_v.termName + '",';
        });
        csv += '\n';
        new_line = false;
      }
    }
    if (new_line == true){
      csv += '\n';
    }
  });

  let csvData = new Blob([csv], { type: 'data:text/csv;charset=utf-8,' });
  let csvUrl = URL.createObjectURL(csvData);
  let link  = document.createElement('a');
  link.href = csvUrl;
  link.target = '_blank';
  link.download = 'Compare_Values_GDC.csv';
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export const compare = (gv) => {

  if ($('#cp_input').val().trim() === '') {
    $('#cp_massage').html("Please type in user defined values.");
    return;
  }
  else {

    if (gv.length > 500 ) {
      $('#gdc-loading-icon').show()
    }

    setTimeout(() => {

    //compare and render
    $('#cp_massage').html("");
    $('#compare_form').css('display', 'none');
    $('#compare_result').css('display', 'block');

    $('#compare-input').hide();
    $('#compare-matched').show();
    $('#compare_download').show();

    $('#compare').hide();
    $('#cancelCompare').hide();
    $('#cp_bottom-matched').show();

    let vs = $('#cp_input').val().split(/\n/);

    let options = {};

    options.partial = $("#compare_filter").prop('checked');
    options.unmatched = $("#compare_unmatched").prop('checked');
    options.synonyms = $("#compare_synonyms").prop('checked');
    const items = compareGDCvalues(vs, gv, options);
    $('#compare-matched').data('compareResult', items);
    $('#compare-matched').data('options', options);

    $('#pagination-matched').pagination({
      dataSource: items,
      pageSize: 50,
      callback: function(data, pagination) {
        const html = showCompareResult(data, options);
        $('#compare_result').html(html);
      }
    });

    $('#compare_filter').bind('click', function () {
      if(!$('#compare_result').is(':visible')) return;
      let options = {};
      options.partial = $("#compare_filter").prop('checked');
      options.unmatched = $("#compare_unmatched").prop('checked');
      options.synonyms = $("#compare_synonyms").prop('checked');

      if (gv.length > 500 ) {
        $('#gdc-loading-icon').show()
      }

      setTimeout(() => {
        const items = compareGDCvalues(vs, gv, options);
        $('#compare-matched').data('compareResult', items);
        $('#compare-matched').data('options', options);

        $('#pagination-matched').pagination({
          dataSource: items,
          pageSize: 50,
          callback: function(data, pagination) {
            const html = showCompareResult(data, options);
            $('#compare_result').html(html);
          }
        });

        if (gv.length > 500 ) {
          $('#gdc-loading-icon').hide()
        }
      },100);
    });

    $('#compare_unmatched').bind('click', function () {
      if(!$('#compare_result').is(':visible')) return;
      let options = {};
      options.partial = $("#compare_filter").prop('checked');
      options.unmatched = $("#compare_unmatched").prop('checked');
      options.synonyms = $("#compare_synonyms").prop('checked');

      if (gv.length > 500 ) {
        $('#gdc-loading-icon').show()
      }

      setTimeout(() => {
        const items = compareGDCvalues(vs, gv, options);
        $('#compare-matched').data('compareResult', items);
        $('#compare-matched').data('options', options);

        $('#pagination-matched').pagination({
          dataSource: items,
          pageSize: 50,
          callback: function(data, pagination) {
            const html = showCompareResult(data, options);
            $('#compare_result').html(html);
          }
        });

        if (gv.length > 500 ) {
          $('#gdc-loading-icon').hide()
        }
      },100);
    });

    $('#compare_synonyms').bind('click', function () {
      if(!$('#compare_result').is(':visible')) return;
      let options = {};
      options.partial = $("#compare_filter").prop('checked');
      options.unmatched = $("#compare_unmatched").prop('checked');
      options.synonyms = $("#compare_synonyms").prop('checked');

      if (gv.length > 500 ) {
        $('#gdc-loading-icon').show()
      }

      setTimeout(() => {
        const items = compareGDCvalues(vs, gv, options);
        $('#compare-matched').data('compareResult', items);
        $('#compare-matched').data('options', options);

        $('#pagination-matched').pagination({
          dataSource: items,
          pageSize: 50,
          callback: function(data, pagination) {
            const html = showCompareResult(data, options);
            $('#compare_result').html(html);
          }
        });

        if (gv.length > 500 ) {
          $('#gdc-loading-icon').hide()
        }
      },100);
    });

    $('#downloadCompareCVS').bind('click', function () {
      if (gv.length > 500 ) {
        $('#gdc-loading-icon').show()
      }
      setTimeout(() => {
        const items = $('#compare-matched').data('compareResult');
        downloadCompareCVS(items);
        if (gv.length > 500 ) {
          $('#gdc-loading-icon').hide()
        }
      },100);
    });

    $('#back2Compare').bind('click', function () {
      $('#compare_result').html("");
      $('#compare-matched').val('');
      $('#compare_result').css("display", "none");
      $('#compare_form').css("display", "block");

      $('#compare-input').show();
      $('#compare-matched').hide();
      $('#compare_download').hide();

      $('#compare').show();
      $('#cancelCompare').show();
      $('#cp_bottom-matched').hide();
    });

    if (gv.length > 500 ) {
      $('#gdc-loading-icon').hide()
    }

    },100);
  }
}

export const removePopUps = () => {
  if ($('#gdc_data').length) {
    $('#gdc_data').remove();
  }

  if ($('#caDSR_data').length) {
    $('#caDSR_data').remove();
  }

  if ($('#gdc_terms_data').length) {
    $('#gdc_terms_data').remove();
  }

  if ($('#ncit_details').length) {
    $('#ncit_details').remove();
  }

  if ($('#compare_dialog').length) {
    $('#compare_dialog').remove();
  }

  if ($('#compareGDC_dialog').length) {
    $('#compareGDC_dialog').remove();
  }
}
