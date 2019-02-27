import getCDEData from './cde-data/cde-data';
import gdcData from './gdc-data/gdc-data';
import toCompare from './to-compare/to-compare';
import compareGDC from './compare-gdc/compare-gdc';
import GDCTerms from './gdc-terms/gdc-terms';
import getNCITDetails from './ncit-details/ncit-details'

export const dialogEvents = ($root, $body) => {
  $root.on('click', '.getCDEData', (event) => {
    event.preventDefault();
    let data = event.currentTarget.dataset;
    getCDEData(data.cdeid, data.targets);
  });

  $root.on('click', '.getGDCData', (event) => {
    event.preventDefault();
    let data = event.currentTarget.dataset;
    let uid = data.ref.replace(/@/g, '/');
    gdcData(uid, data.tgt, data.keyword);
  });

  $root.on('click', '.toCompare', (event) => {
    event.preventDefault();
    let data = event.currentTarget.dataset;
    let uid = data.ref.replace(/@/g, '/');
    toCompare(uid);
  });

  $root.on('click', '.compareGDC', (event) => {
    event.preventDefault();
    let data = event.currentTarget.dataset;
    let uid = data.ref.replace(/@/g, '/');
    compareGDC(uid, data.cdeid);
  });

  $root.on('click', '.getGDCTerms', (event) => {
    event.preventDefault();
    let data = event.currentTarget.dataset;
    let uid = data.ref.replace(/@/g, '/');
    GDCTerms(uid, data.targets);
  });

  $body.on('click', '.getNCITDetails', (event) => {
    event.preventDefault();
    let data = event.currentTarget.dataset;
    getNCITDetails(data.uid);
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
    let caseSensitiveV = v;
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
            if (em.s.indexOf(tmp) !== -1 && checker_n.indexOf(toV[i].n) === -1) {
              text.push(toV[i]);
              checker_n.push(toV[i].n);
              v_matched.push(i);
            }
          }
        });
        let checker_n_c = getMatchedSynonyms(text, tmp, option);
        text.forEach(em => {
          if(em.match === undefined) em.match = caseSensitiveV;
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
            if(em.match === undefined) em.match = caseSensitiveV;
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


const generateCompareResult = (items, option) => {

  
  //console.log(items[-1]);
  return `<div class="table__body row">
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
                <div class="col-xs-10">${item.n !== '' ? item.n.replace(reg_key, '<b>$&</b>') : `<span style="color:red;">--</span>`}</div>
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
                                <th>Term</th>
                                <th>Source</th>
                                <th>Type</th>
                              </tr>
                            </thead>

                            ${match.s.map((syn) => `
                              <tr>
                                <td>${syn.termName.replace(reg_key, '<b>$&</b>')}</td>
                                <td>${syn.termSource !== undefined && syn.termSource !== null ? syn.termSource : ``}</td>
                                <td>${syn.termGroup !== undefined && syn.termGroup !== null ? syn.termSource : ``}</td>
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
                      ${item.ic_enum.map((ic_e)=>`${ic_e.replace(reg_key, '<b>$&</b>')}</br>`.trim()).join('')}
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
                                  <th>Term</th>
                                  <th>Source</th>
                                  <th>Type</th>
                                </tr>
                              </thead>

                              ${syn.s.map((s_v) => `
                                ${option.synonyms === false && option.partial === false ? `
                                  <tr>
                                    <td>${s_v.termName}</td>
                                    <td>${s_v.termSource !== undefined && s_v.termSource !== null ? s_v.termSource : ``}</td>
                                    <td>${s_v.termGroup !== undefined && s_v.termGroup !== null ? s_v.termSource : ``}</td>
                                  </tr>
                                `:`
                                  ${option.synonyms === true && option.partial === true ? `
                                    <tr>
                                      <td>${s_v.termName.replace(reg_key, '<b>$&</b>')}</td>
                                      <td>${s_v.termSource !== undefined && s_v.termSource !== null ? s_v.termSource : ``}</td>
                                      <td>${s_v.termGroup !== undefined && s_v.termGroup !== null ? s_v.termSource : ``}</td>
                                    </tr>
                                  `:`
                                    ${option.synonyms === true && s_v.termName.trim().toLowerCase() === (item.match !== undefined ? item.match.trim().toLowerCase() : false) ? `
                                      <tr>
                                        <td><b>${s_v.termName}<b></td>
                                        <td>${s_v.termSource !== undefined && s_v.termSource !== null ? s_v.termSource : ``}</td>
                                        <td>${s_v.termGroup !== undefined && s_v.termGroup !== null ? s_v.termSource : ``}</td>
                                      </tr>
                                    `:`
                                      <tr>
                                        <td>${s_v.termName}</td>
                                        <td>${s_v.termSource !== undefined && s_v.termSource !== null ? s_v.termSource : ``}</td>
                                        <td>${s_v.termGroup !== undefined && s_v.termGroup !== null ? s_v.termSource : ``}</td>
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
                <div class="col-xs-10">${item.n !== '' ? item.n.replace(reg_key, '<b>$&</b>') : `<span style="color:red;">--</span>`}</div>
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
                                <th>Term</th>
                                <th>Source</th>
                                <th>Type</th>
                              </tr>
                            </thead>

                            ${match.s.map((syn) => `
                              <tr>
                                <td>${syn.termName.replace(reg_key, '<b>$&</b>')}</td>
                                <td>${syn.termSource !== undefined && syn.termSource !== null ? syn.termSource : ``}</td>
                                <td>${syn.termGroup !== undefined && syn.termGroup !== null ? syn.termSource : ``}</td>
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
                                <th>Term</th>
                                <th>Source</th>
                                <th>Type</th>
                              </tr>
                            </thead>

                            ${item.s.map((syn) => `
                              ${option.synonyms === false && option.partial === false ? `
                                <tr>
                                  <td>${syn.termName}</td>
                                  <td>${syn.termSource !== undefined && syn.termSource !== null ? syn.termSource : ``}</td>
                                  <td>${syn.termGroup !== undefined && syn.termGroup !== null ? syn.termSource : ``}</td>
                                </tr>
                              `:`
                                ${option.synonyms === true && option.partial === true ? `
                                  <tr>
                                    <td>${syn.termName.replace(reg_key, '<b>$&</b>')}</td>
                                    <td>${syn.termSource !== undefined && syn.termSource !== null ? syn.termSource : ``}</td>
                                    <td>${syn.termGroup !== undefined && syn.termGroup !== null ? syn.termSource : ``}</td>
                                  </tr>
                                `:`
                                  ${option.synonyms === true && syn.termName.trim().toLowerCase() === (item.match !== undefined ? item.match.trim().toLowerCase() : false) ? `
                                    <tr>
                                      <td><b>${syn.termName}<b></td>
                                      <td>${syn.termSource !== undefined && syn.termSource !== null ? syn.termSource : ``}</td>
                                      <td>${syn.termGroup !== undefined && syn.termGroup !== null ? syn.termSource : ``}</td>
                                    </tr>
                                  `:`
                                    <tr>
                                      <td>${syn.termName}</td>
                                      <td>${syn.termSource !== undefined && syn.termSource !== null ? syn.termSource : ``}</td>
                                      <td>${syn.termGroup !== undefined && syn.termGroup !== null ? syn.termSource : ``}</td>
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
  </div>`
}



const OLD_generateCompareResult = (fromV, toV, option) => {
  toV = JSON.parse(JSON.stringify(toV));
  let v_lowercase = [], v_matched = [];
  toV.forEach(function (v) {
    v_lowercase.push(v.n.trim().toLowerCase());
    if(v.s && v.s.length > 0) v.s = v.s.map(function(x){ return {termName: x.termName.toLowerCase(), termSource: x.termSource, termGroup: x.termGroup}; });
    if(v.all_syn && v.all_syn.length > 0) v.all_syn = v.all_syn.map(function(x){ return x.toLowerCase(); });
  });

  let table = '<div class="table__body row">'
    + '<div class="col-xs-12">';

  fromV.forEach(function (v) {
    v = v.trim().toLowerCase().replace(/[\ ]+/g, " ");
    let reg_key = new RegExp(v, "ig");
    let new_v = v;
    let tmp = v;
    if (tmp === '') {
      return;
    }
    let text = [];
    if (option.partial === false) { // If exact match is checked
      let checker_n = [];
      let idx = v_lowercase.indexOf(tmp);
      if (idx >= 0) {
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
            if (em.s.indexOf(tmp) !== -1 && checker_n.indexOf(toV[i].n) === -1) {
              text.push(toV[i]);
              checker_n.push(toV[i].n);
              v_matched.push(i);
            }
          }
        });
        let checker_n_c = getMatchedSynonyms(text, tmp, option);
        text.forEach(em => {
          em.match = v;
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
            em.match = v;
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
    if (text.length === 0) {
      text = '<div style="color:red;">--</div>';
      table += '<div class="table__row row">'
        + '<div class="table__td table__td--slim col-xs-6">' + v + '</div>'
        + '<div class="table__td table__td--slim col-xs-6">' + text + '</div>'
        + '</div>';
    } else {
      table += '<div class="table__row row">';
      text.forEach((tmp_text, index) => {
        if (index !== 0) v = "";
        table += '<div class="table__td table__td--slim col-xs-6">' + v + '</div>';
        if (tmp_text.n_syn) {
          table +='<div class="table__td table__gdc-match table__td--slim col-xs-6">'
          + '<div class="row">'
            + '<div class="col-xs-10">' + tmp_text.n.replace(reg_key, '<b>$&</b>') +'</div>'
            + '<div class="col-xs-2 table__right">';
            if (tmp_text.n_syn.length !== 0) {
              table += '<a href="#" class="compare-form__toggle" aria-label="expand" title="expand" aria-expanded="false"><i class="fa fa-plus"></i></a>';
            }
            table +='</div>'
          +'</div>';
          if (tmp_text.matched_s !== undefined && tmp_text.matched_s.length !== 0) {
            table +='<div class="compare-form__matched">';
            tmp_text.matched_s.forEach((match) => {
              table +='<div class="row table__td">'
              + '<div class="col-xs-3">' + match.n_c + ' (NCIt)</div>'
              + '<div class="col-xs-9">';
              if(match.s){
                table += '<table class="table table-striped">'
                  +'<thead>'
                    +'<tr>'
                      +'<th>Term</th>'
                      +'<th>Source</th>'
                      +'<th>Type</th>'
                    +'</tr>'
                  +'</thead>';
                  match.s.forEach((syn) => {
                    table += '<tr>'
                      + '<td>' + syn.termName.replace(reg_key, '<b>$&</b>') + '</td>';
                      if(syn.termSource !== undefined && syn.termSource !== null) table += '<td>'+ syn.termSource + '</td>'
                      if(syn.termGroup !== undefined && syn.termGroup !== null) table += '<td>'+ syn.termGroup + '</td>'
                      +'</tr>';
                  });
                table += '</table>';
              }
              table +='</div></div>';
            });
            table +='</div>';
          }
          table +='<div class="compare-form__synm" style="display: none;">';
            if (tmp_text.i_c !== undefined) {
              table +='<div class="row table__td">'
              + '<div class="col-xs-3">' + tmp_text.i_c.c + ' (ICD-O-3)</div>'
              + '<div class="col-xs-9">';
              tmp_text.ic_enum.forEach(function (ic_e) {
                  table += ic_e + '</br>';
                });
              table +='</div></div>';
            }
            if (tmp_text.n_syn.length !== 0) {
              tmp_text.n_syn.forEach(function(syn){
                if (syn.s !== undefined && syn.s.length !== 0) {
                  table +='<div class="row table__td">'
                  + '<div class="col-xs-3">' + syn.n_c + ' (NCIt)</div>'
                  + '<div class="col-xs-9">';
                  if(syn.s){
                    table += '<table class="table table-striped">'
                      +'<thead>'
                        +'<tr>'
                          +'<th>Term</th>'
                          +'<th>Source</th>'
                          +'<th>Type</th>'
                        +'</tr>'
                      +'</thead>';
                    syn.s.forEach(function (s_v) {
                      if(option.synonyms === false && option.partial === false){
                        table += '<tr>'
                          + '<td>' + s_v.termName + '</td>';
                          if(s_v.termSource !== undefined && s_v.termSource !== null) table += '<td>'+ s_v.termSource + '</td>'
                          if(s_v.termGroup !== undefined && s_v.termGroup !== null) table += '<td>'+ s_v.termGroup + '</td>'
                          +'</tr>';
                      }
                      else if(option.synonyms === true && option.partial === true){
                        table += '<tr>'
                          + '<td>' + s_v.termName.replace(reg_key, '<b>$&</b>') + '</td>';
                          if(s_v.termSource !== undefined && s_v.termSource !== null) table += '<td>'+ s_v.termSource + '</td>'
                          if(s_v.termGroup !== undefined && s_v.termGroup !== null) table += '<td>'+ s_v.termGroup + '</td>'
                          +'</tr>';
                      }
                      else if(option.synonyms === true && s_v.termName.trim().toLowerCase() === new_v.trim().toLowerCase()){
                        table += '<tr>'
                          + '<td><b>' +s_v.termName + '</b></td>';
                          if(s_v.termSource !== undefined && s_v.termSource !== null) table += '<td>'+ s_v.termSource + '</td>'
                          if(s_v.termGroup !== undefined && s_v.termGroup !== null) table += '<td>'+ s_v.termGroup + '</td>'
                          +'</tr>';
                      }
                      else{
                        table += '<tr>'
                          + '<td>' +s_v.termName + '</td>';
                          if(s_v.termSource !== undefined && s_v.termSource !== null) table += '<td>'+ s_v.termSource + '</td>'
                          if(s_v.termGroup !== undefined && s_v.termGroup !== null) table += '<td>'+ s_v.termGroup + '</td>'
                          +'</tr>';
                      }
                    });
                    table += '</table>';
                  }
                  table +='</div></div>';
                }
              });
            }
        table +='</div></div>';
        }

        if (tmp_text.s) {
          table +='<div class="table__td table__gdc-match table__td--slim col-xs-6">'
            + '<div class="row">'
              + '<div class="col-xs-10">' + tmp_text.n.replace(reg_key, '<b>$&</b>') +'</div>'
              + '<div class="col-xs-2 table__right">';
              if (tmp_text.s.length !== 0) {
                table += '<a href="#" class="compare-form__toggle" aria-label="expand" title="expand" aria-expanded="false"><i class="fa fa-plus"></i></a>';
              }
              table += '</div>'
            +'</div>';
            if (tmp_text.matched_s !== undefined && tmp_text.matched_s.length !== 0) {
              table +='<div class="compare-form__matched">';
              tmp_text.matched_s.forEach((match) => {
                table +='<div class="row table__td">'
                + '<div class="col-xs-3">' + match.n_c + ' (NCIt)</div>'
                + '<div class="col-xs-9">';
                if(match.s){
                  table += '<table class="table table-striped">'
                    +'<thead>'
                      +'<tr>'
                        +'<th>Term</th>'
                        +'<th>Source</th>'
                        +'<th>Type</th>'
                      +'</tr>'
                    +'</thead>';
                    match.s.forEach((syn) => {
                      table += '<tr>'
                        + '<td>' + syn.termName.replace(reg_key, '<b>$&</b>') + '</td>';
                        if(syn.termSource !== undefined && syn.termSource !== null) table += '<td>'+ syn.termSource + '</td>'
                        if(syn.termGroup !== undefined && syn.termGroup !== null) table += '<td>'+ syn.termGroup + '</td>'
                        +'</tr>';
                    });
                  table += '</table>';
                }
                table +='</div></div>';
              });
              table +='</div>';
            }
            if (tmp_text.s.length !== 0) {
              table +='<div class="compare-form__synm" style="display: none;">'
                +'<div class="row table__td">'
                  + '<div class="col-xs-3">' + tmp_text.n_c + ' (NCIt)</div>'
                  + '<div class="col-xs-9">';
                  if(tmp_text.s){
                    table += '<table class="table table-striped">'
                      +'<thead>'
                        +'<tr>'
                          +'<th>Term</th>'
                          +'<th>Source</th>'
                          +'<th>Type</th>'
                        +'</tr>'
                      +'</thead>';
                    tmp_text.s.forEach(function (s_v) {
                      if(option.synonyms === false && option.partial === false){
                        table += '<tr>'
                          + '<td>' + s_v.termName + '</td>';
                          if(s_v.termSource !== undefined && s_v.termSource !== null) table += '<td>'+ s_v.termSource + '</td>'
                          if(s_v.termGroup !== undefined && s_v.termGroup !== null) table += '<td>'+ s_v.termGroup + '</td>'
                          +'</tr>';
                      }
                      else if(option.synonyms === true && option.partial === true){
                        table += '<tr>'
                          + '<td>' + s_v.termName.replace(reg_key, '<b>$&</b>') + '</td>';
                          if(s_v.termSource !== undefined && s_v.termSource !== null) table += '<td>'+ s_v.termSource + '</td>'
                          if(s_v.termGroup !== undefined && s_v.termGroup !== null) table += '<td>'+ s_v.termGroup + '</td>'
                          +'</tr>';
                      }
                      else if(option.synonyms === true && s_v.termName.trim().toLowerCase() === new_v.trim().toLowerCase()){
                        table += '<tr>'
                          + '<td><b>' +s_v.termName + '</b></td>';
                          if(s_v.termSource !== undefined && s_v.termSource !== null) table += '<td>'+ s_v.termSource + '</td>'
                          if(s_v.termGroup !== undefined && s_v.termGroup !== null) table += '<td>'+ s_v.termGroup + '</td>'
                          +'</tr>';
                      }
                      else{
                        table += '<tr>'
                          + '<td>' +s_v.termName + '</td>';
                          if(s_v.termSource !== undefined && s_v.termSource !== null) table += '<td>'+ s_v.termSource + '</td>'
                          if(s_v.termGroup !== undefined && s_v.termGroup !== null) table += '<td>'+ s_v.termGroup + '</td>'
                          +'</tr>';
                      }
                    });
                    table += '</table>';
                  }

                table +='</div></div>'
              +'</div>';
            }
          table +='</div>';
        }

        if (tmp_text.s === undefined && tmp_text.n_syn === undefined) {
          table +='<div class="table__td table__td--slim col-xs-6">' + tmp_text.n + '</div>'
        }

      });
      table += '</div>'
    }
  });

  if(option.unmatched === true){
    for (var i = 0; i < toV.length; i++) {
      if (v_matched.indexOf(i) >= 0) {
        continue;
      }
      table += '<div class="table__row row">'
        + '<div class="table__td table__td--slim col-xs-6"><div style="color:red;">--</div></div>'

        if (toV[i].n_syn) {
          table +='<div class="table__td table__gdc-match table__td--slim col-xs-6">'
          + '<div class="row">'
            + '<div class="col-xs-10">' + toV[i].n + '</div>'
            + '<div class="col-xs-2 table__right">'
            if (toV[i].n_syn.length !== 0) {
              table += '<a href="#" class="compare-form__toggle" aria-label="expand" title="expand" aria-expanded="false"><i class="fa fa-plus"></i></a>'
            }
            table +='</div>'
          +'</div>'
          + '<div class="compare-form__synm" style="display: none;">'
            if (toV[i].i_c !== undefined) {
              table +='<div class="row table__td">'
              + '<div class="col-xs-3">' + toV[i].i_c.c + ' (ICD-O-3)</div>'
              + '<div class="col-xs-9">'
              toV[i].ic_enum.forEach(function (ic_e) {
                  table += ic_e + '</br>'
                });
              table +='</div></div>'
            }
            if (toV[i].n_syn.length !== 0) {
              toV[i].n_syn.forEach(function(syn){
                if (syn.s !== undefined && syn.s.length !== 0) {
                  table +='<div class="row table__td">'
                  + '<div class="col-xs-3">' + syn.n_c + ' (NCIt)</div>'
                  + '<div class="col-xs-9">'
                  if(syn.s){
                    table += '<table class="table table-striped">'
                      +'<thead>'
                        +'<tr>'
                          +'<th>Term</th>'
                          +'<th>Source</th>'
                          +'<th>Type</th>'
                        +'</tr>'
                      +'</thead>';
                      syn.s.forEach((syn) => {
                        table += '<tr>'
                          + '<td>' + syn.termName + '</td>';
                          if(syn.termSource !== undefined && syn.termSource !== null) table += '<td>'+ syn.termSource + '</td>'
                          if(syn.termGroup !== undefined && syn.termGroup !== null) table += '<td>'+ syn.termGroup + '</td>'
                          +'</tr>';
                      });
                    table += '</table>';
                  }
                  table +='</div></div>'
                }
              });
            }
        table +='</div></div>';
        }

        if (toV[i].s) {
          table +='<div class="table__td table__gdc-match table__td--slim col-xs-6">'
            + '<div class="row">'
              + '<div class="col-xs-10">' + toV[i].n + '</div>'
              + '<div class="col-xs-2 table__right">';
              if (toV[i].s.length !== 0) {
                table += '<a href="#" class="compare-form__toggle" aria-label="expand" title="expand" aria-expanded="false"><i class="fa fa-plus"></i></a>';
              }
              table += '</div>'
            +'</div>';
            if (toV[i].s.length !== 0) {
              table +='<div class="compare-form__synm" style="display: none;">'
                +'<div class="row table__td">'
                  + '<div class="col-xs-3">' + toV[i].n_c + ' (NCIt)</div>'
                  + '<div class="col-xs-9">';
                  if(toV[i].s){
                    table += '<table class="table table-striped">'
                      +'<thead>'
                        +'<tr>'
                          +'<th>Term</th>'
                          +'<th>Source</th>'
                          +'<th>Type</th>'
                        +'</tr>'
                      +'</thead>';
                      toV[i].s.forEach((syn) => {
                        table += '<tr>'
                          + '<td>' + syn.termName + '</td>';
                          if(syn.termSource !== undefined && syn.termSource !== null) table += '<td>'+ syn.termSource + '</td>'
                          if(syn.termGroup !== undefined && syn.termGroup !== null) table += '<td>'+ syn.termGroup + '</td>'
                          +'</tr>';
                      });
                    table += '</table>';
                  }
                table +='</div></div>'
              +'</div>';
            }
          table +='</div>';
        }
        table +='</div>';
    }
  }

  table += '</div></div>'
  return table;
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

const downloadCompareCVS = (fromV, toV, option) => {
  toV = JSON.parse(JSON.stringify(toV));
  let v_lowercase = [], v_matched = [];
  toV.forEach(function (v) {
    v_lowercase.push(v.n.trim().toLowerCase());
    if(v.s && v.s.length > 0) v.s = v.s.map(function(x){ return {termName: x.termName.toLowerCase(), termSource: x.termSource, termGroup: x.termGroup}; });
    if(v.all_syn && v.all_syn.length > 0) v.all_syn = v.all_syn.map(function(x){ return x.toLowerCase(); });
  });

  let csv = 'User Defined Values,Matched GDC Values,ICDO3 code, NCIt code, ICDO3 Strings/Synonyms,\n';

  fromV.forEach(function (v) {
    let tmp = v.trim().toLowerCase();
    if (tmp === '') {
      return;
    }
    let text = [];
    if (option.partial === false) { // If exact match is checked
      let checker_n = [];
      let idx = v_lowercase.indexOf(tmp);
      if (idx >= 0) {
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
            if (em.s.indexOf(tmp) !== -1 && checker_n.indexOf(toV[i].n) === -1) {
              text.push(toV[i]);
              checker_n.push(toV[i].n);
              v_matched.push(i);
            }
          }
        });
      }
    } else { // If exact match is not checked
      let checker_n = [];
      v_lowercase.forEach((v_tmp, index) => {
        let idx = v_tmp.indexOf(tmp);
        if (idx >= 0 && checker_n.indexOf(toV[index].n) === -1) {
          text.push(toV[index]);
          checker_n.push(toV[index].n);
          v_matched.push(index);
        }
        if (option.synonyms === true){
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
        }
      })
    }

    if (text.length > 0) text.sort((a, b) => (a.n.toLowerCase() > b.n.toLowerCase()) ? 1 : ((b.n.toLowerCase() > a.n.toLowerCase()) ? -1 : 0));
    if (text.length === 0) {
      csv += '"' + v + '","--' + '"\n';
    } else {
      text.forEach((tmp_text, index) => {
        let new_line = true;
        if (index !== 0) v = "";
        csv +='"' + v + '","' + tmp_text.n + '",';
        csv += tmp_text.i_c !== undefined ? '"' + tmp_text.i_c.c + '",': '"",';
        if(tmp_text.ic_enum){
          tmp_text.ic_enum.forEach((icenum, i) => {
            csv += i === 0 ? '"","' + icenum + '",':'"' + icenum + '",';
          })
        }

        if (tmp_text.n_syn) {
          if (tmp_text.n_syn.length !== 0) {
            tmp_text.n_syn.forEach(function(syn, tmp_index) {
              if (syn.s.length !== 0) {
                csv += tmp_index === 0 ? '""\n,,,"' + syn.n_c + '",':'"","","","' + syn.n_c + '",';
                syn.s.forEach(function (s_v) {
                  csv += '"' + s_v.termName + '",';
                });
                csv += '\n';
                new_line = false;
              }
            });
          }
        }

        if (tmp_text.s) {
          if (tmp_text.s.length !== 0) {
            csv +='"' + tmp_text.n_c + '",';
            tmp_text.s.forEach(function (s_v) {
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
    }
  });

  for (var i = 0; i < toV.length; i++) {
    if (v_matched.indexOf(i) >= 0) {
      continue;
    }
    if(!option.unmatched){
      continue;
    }

    let new_line = true;
    csv +='"--","' + toV[i].n + '",'
        csv += toV[i].i_c !== undefined ? '"' + toV[i].i_c.c + '",': '"",';
        if(toV[i].ic_enum){
          toV[i].ic_enum.forEach((icenum, i) => {
            csv += i === 0 ? '"","' + icenum + '",':'"' + icenum + '",';
          })
        }
        if (toV[i].n_syn) {
          if (toV[i].n_syn.length !== 0) {
            toV[i].n_syn.forEach(function(syn, index) {
              if (syn.s !== undefined && syn.s.length !== 0) {
                csv += index === 0 ? '""\n,,,"' + syn.n_c + '",':'"","","","' + syn.n_c + '",';
                syn.s.forEach(function (s_v) {
                  csv += '"' + s_v.termName + '",';
                });
                csv += '\n';
                new_line = false;
              }
            });
          }
        }
        if (toV[i].s) {
          if (toV[i].s.length !== 0) {
            csv +='"' + toV[i].n_c + '",';
            toV[i].s.forEach(function (s_v) {
              csv += '"' + s_v.termName + '",';
            });
            csv += '\n';
            new_line = false;
          }
        }
        if (new_line == true){
          csv += '\n';
        }
  }

  let hiddenElement = document.createElement('a');
  hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
  hiddenElement.target = '_blank';
  hiddenElement.download = 'Compare_Values_GDC.csv';
  hiddenElement.click();
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
    $('#back2Compare').show();


    let vs = $('#cp_input').val().split(/\n/);

    let options = {};

    options.partial = $("#compare_filter").prop('checked');
    options.unmatched = $("#compare_unmatched").prop('checked');
    options.synonyms = $("#compare_synonyms").prop('checked');
    const items = compareGDCvalues(vs, gv, options);
    $('#compare-matched').data('compareResult', items);
    const table = generateCompareResult(items, options);
    let html = '<div id="cp_result_table" class="table__container table__container--margin-bottom">' + table + '</div>';

    $('#compare_result').html(html);

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
        const table_new = generateCompareResult(items, options);
        $('#cp_result_table').html(table_new);

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
        const table_new = generateCompareResult(items, options);
        $('#cp_result_table').html(table_new);

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
        const table_new = generateCompareResult(items, options);
        $('#cp_result_table').html(table_new);

        if (gv.length > 500 ) {
          $('#gdc-loading-icon').hide()
        }
      },100);
    });

    $('#downloadCompareCVS').bind('click', function () {
      let options = {};
      options.partial = $("#compare_filter").prop('checked');
      options.unmatched = $("#compare_unmatched").prop('checked');
      options.synonyms = $("#compare_synonyms").prop('checked');

      if (gv.length > 500 ) {
        $('#gdc-loading-icon').show()
      }

      setTimeout(() => {
        downloadCompareCVS(vs, gv, options);

        if (gv.length > 500 ) {
          $('#gdc-loading-icon').hide()
        }
      },100);
    });

    $('#back2Compare').bind('click', function () {
      $('#compare_result').html("");
      $('#compare_result').css("display", "none");
      $('#compare_form').css("display", "block");

      $('#compare-input').show();
      $('#compare-matched').hide();
      $('#compare_download').hide();

      $('#compare').show();
      $('#cancelCompare').show();
      $('#back2Compare').hide();
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
