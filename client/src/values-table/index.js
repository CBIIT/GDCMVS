import tmpl from './view';

const func = {
  render(items, keyword, search_option) {
    //data preprocessing
    let values = [];
    let len = 0;
    //options render
    let options = {};
    // RegExp Keyword
    keyword = keyword.trim().replace(/[\ ,:_-]+/g, " ");
    let reg_key = new RegExp(keyword, "ig");

    items.forEach(function (item) {
      let hl = item.highlight;
      if (hl["enum.n"] == undefined && hl["enum.n.have"] == undefined &&
        hl["enum.s"] == undefined && hl["enum.s.have"] == undefined &&
        hl["cde_pv.n"] == undefined && hl["cde_pv.n.have"] == undefined &&
        hl["cde_pv.ss.s"] == undefined && hl["cde_pv.ss.s.have"] == undefined &&
        hl["enum.i_c.c"] == undefined && hl["enum.i_c.have"] == undefined &&
        hl["enum.n_c"] == undefined && hl["cde_pv.ss.c"] == undefined && hl["cde.id"] == undefined
      ) {
        return;
      }
      let source = item._source;
      let dict_enum_n = {};
      let dict_enum_s = {};
      let dict_enum_n_c = {};
      let dict_cde_n = {};
      let dict_cde_s = {};
      let dict_cde_id = {};
      let dict_cde_n_c = {};
      let arr_enum_c = [];
      let arr_enum_c_have = [];
      //each row in the values tab will be put into values
      let row = {};
      row.category = source.category;
      row.node = source.node;
      row.name = source.name;
      row.local = source.enum == undefined ? false : true;
      row.syn = false;
      if (source.enum !== undefined) {
        //check if synonyms exists
        source.enum.forEach(function (em) {
          if (row.syn) return;

          if (em.n_c !== undefined) {
            row.syn = true;
          }
        });
      }
      row.ref = source.name + "@" + source.node + "@" + source.category;
      row.cdeId = source.cde !== undefined ? source.cde.id : "";
      row.cdeUrl = source.cde !== undefined ? source.cde.url : "";
      row.cdeLen = source.cde_pv == undefined || source.cde_pv.length == 0 ? false : true;
      //value informations in the subtable
      row.vs = [];
      row.tgts_enum_n = ""; //added
      row.tgts_cde_n = "";
      let enum_n = ("enum.n" in hl) || ("enum.n.have" in hl) ? hl["enum.n"] || hl["enum.n.have"] : [];
      let enum_s = ("enum.s" in hl) || ("enum.s.have" in hl) ? hl['enum.s'] || hl["enum.s.have"] : [];
      let enum_n_c = ("enum.n_c" in hl) ? hl["enum.n_c"] : [];
      let cde_id = ("cde.id" in hl) ? hl["cde.id"] : [];
      let cde_n = ("cde_pv.n" in hl) || ("cde_pv.n.have" in hl) ? hl["cde_pv.n"] || hl["cde_pv.n.have"] : [];
      let cde_s = ("cde_pv.ss.s" in hl) || ("cde_pv.ss.s.have" in hl) ? hl["cde_pv.ss.s"] || hl["cde_pv.ss.s.have"] : [];
      let cde_n_c = ("cde_pv.ss.c" in hl) ? hl["cde_pv.ss.c"] : [];
      let enum_c = ("enum.i_c.c" in hl) ? hl["enum.i_c.c"] : [];
      let enum_c_have = ("enum.i_c.have" in hl) ? hl["enum.i_c.have"] : [];
      enum_n.forEach(function (n, i) {
        let tmp = n.replace(/<b>/g, "").replace(/<\/b>/g, "");
        if (keyword.indexOf(' ') === -1) {
          dict_enum_n[tmp] = n.replace(/<b>/g, "").replace(/<\/b>/g, "").replace(reg_key, "<b>$&</b>");
        } else {
          dict_enum_n[tmp] = n;
        }
      });
      enum_s.forEach(function (s) {
        let tmp = s.replace(/<b>/g, "").replace(/<\/b>/g, "");
        if (keyword.indexOf(' ') === -1) {
          dict_enum_s[tmp] = s.replace(/<b>/g, "").replace(/<\/b>/g, "").replace(reg_key, "<b>$&</b>");
        } else {
          dict_enum_s[tmp] = s;
        }
      });
      enum_n_c.forEach(function (s) {
        let tmp = s.replace(/<b>/g, "").replace(/<\/b>/g, "");
        if (keyword.indexOf(' ') === -1) {
          dict_enum_n_c[tmp] = s.replace(/<b>/g, "").replace(/<\/b>/g, "").replace(reg_key, "<b>$&</b>");
        } else {
          dict_enum_n_c[tmp] = s;
        }
      });
      cde_id.forEach(function (pn) {
        let tmp = pn.replace(/<b>/g, "").replace(/<\/b>/g, "");
        if (keyword.indexOf(' ') === -1) {
          dict_cde_id[tmp] = pn.replace(/<b>/g, "").replace(/<\/b>/g, "").replace(reg_key, "<b>$&</b>");
        } else {
          dict_cde_id[tmp] = pn;
        }
      });
      cde_n.forEach(function (pn) {
        let tmp = pn.replace(/<b>/g, "").replace(/<\/b>/g, "");
        if (keyword.indexOf(' ') === -1) {
          dict_cde_n[tmp] = pn.replace(/<b>/g, "").replace(/<\/b>/g, "").replace(reg_key, "<b>$&</b>");
        } else {
          dict_cde_n[tmp] = pn;
        }
      });
      cde_s.forEach(function (ps) {
        let tmp = ps.replace(/<b>/g, "").replace(/<\/b>/g, "");
        if (keyword.indexOf(' ') === -1) {
          dict_cde_s[tmp] = ps.replace(/<b>/g, "").replace(/<\/b>/g, "").replace(reg_key, "<b>$&</b>");
        } else {
          dict_cde_s[tmp] = ps;
        }
      });
      cde_n_c.forEach(function (ps) {
        let tmp = ps.replace(/<b>/g, "").replace(/<\/b>/g, "");
        if (keyword.indexOf(' ') === -1) {
          dict_cde_n_c[tmp] = ps.replace(/<b>/g, "").replace(/<\/b>/g, "").replace(reg_key, "<b>$&</b>");
        } else {
          dict_cde_n_c[tmp] = ps;
        }
      });
      enum_c.forEach(function (c) {
        let tmp = c.replace(/<b>/g, "").replace(/<\/b>/g, "");
        if (arr_enum_c.indexOf(tmp) == -1) {
          arr_enum_c.push(tmp);
        }
      });
      enum_c_have.forEach(function (ch) {
        let tmp = ch.replace(/<b>/g, "").replace(/<\/b>/g, "");
        if (arr_enum_c_have.indexOf(tmp) == -1) {
          arr_enum_c_have.push(tmp);
        }
      });

      //check if there are any matches in the cde synonyms
      let matched_pv = {};
      if (source.cde_pv !== undefined && source.cde_pv.length > 0) {
        source.cde_pv.forEach(function (pv) {
          let exist = false;
          if(source.cde && source.cde.id in dict_cde_id && search_option.syn){ // check if the searched term is CDE ID
            exist = true;
          }
          let tmp_ss = [];
          if (pv.ss !== undefined && pv.ss.length > 0) {
            pv.ss.forEach(function (ss) {
              let tmp_s = [];
              let tmp_s_h = [];
              //remove duplicate
              let cache = {};
              ss.s.forEach(function (s) {
                let lc = s.trim().toLowerCase();
                if (!(lc in cache)) {
                  cache[lc] = [];
                }
                cache[lc].push(s);
              });
              for (let idx in cache) {
                //find the term with the first character capitalized
                let word = findWord(cache[idx]);
                tmp_s.push(word);
              }
              tmp_s.forEach(function (s) {
                if (s in dict_cde_s) {
                  exist = true;
                  tmp_s_h.push(dict_cde_s[s]);
                } else {
                  tmp_s_h.push(s);
                }
              });
              // check if the searched NCIt code matches with CDE NCIt code
              if(ss.c in dict_cde_n_c && search_option.syn){
                ss.c = dict_cde_n_c[ss.c];
                exist = true;
              }
              tmp_ss.push({
                c: ss.c,
                s: tmp_s_h
              });
            });
          }
          exist = exist || (pv.n in dict_cde_n);
          if (exist) {
            //matched_pv[pv.n.toLowerCase()] = tmp_ss;
            matched_pv[pv.n.toLowerCase()] = {
              "pv": (pv.n in dict_cde_n ? dict_cde_n[pv.n] : pv.n),
              "pvm": pv.m,
              "ss": tmp_ss
            };
            pv.n = pv.n.replace(/\'/g, '^');
            row.tgts_cde_n += pv.n + "#";
          }
        });
      }

      if (source.enum) {
        source.enum.forEach(function (em) {
          //check if there are any matches in local synonyms
          let exist = false;
          if(source.cde && source.cde.id in dict_cde_id){ // Check if the searched term is CDE ID
            exist = true;
          }
          let tmp_s = [];
          let t_s = [];
          if (em.s) {
            //remove depulicates in local synonyms
            let cache = {};
            em.s.forEach(function (s) {
              let lc = s.trim().toLowerCase();
              if (!(lc in cache)) {
                cache[lc] = [];
              }
              cache[lc].push(s);
            });
            for (let idx in cache) {
              //find the term with the first character capitalized
              let word = findWord(cache[idx]);
              t_s.push(word);
            }
            t_s.forEach(function (s) {
              if (s in dict_enum_s) {
                exist = true;
                tmp_s.push(dict_enum_s[s])
              } else {
                tmp_s.push(s);
              }
            });
          }
          //value to be put into the subtable
          let v = {};
          if (exist) {
            //check if there is a match to the value name
            if (em.n in dict_enum_n) {
              v.n = dict_enum_n[em.n];
            } else {
              v.n = em.n;
            }
            v.ref = row.ref;
            v.n_c =  em.n_c;
            v.s = tmp_s;
          } else {
            if (em.n in dict_enum_n) {
              v.n = dict_enum_n[em.n];
              v.ref = row.ref;
              v.n_c = em.n_c;
              v.s = tmp_s;
            }
            // If the searched term matches with NCIt Code
            if(em.n_c in dict_enum_n_c){
              v.n = em.n;
              v.ref = row.ref;
              v.n_c = dict_enum_n_c[em.n_c];
              v.s = tmp_s;
            }
          }

          //check if it contains icd-0-3 codes.
          if (em.i_c !== undefined) {
            if (arr_enum_c.indexOf(em.i_c.c) >= 0) {
              v.gdc_d = em.gdc_d;
              if (em.term_type) {
                v.term_type = em.term_type;
              }
              v.i_c = em.i_c.c.replace(reg_key, "<b>$&</b>");
              if (v.n == undefined) {
                v.n = em.n;
                v.ref = row.ref;
                v.n_c = em.n_c;
                v.s = tmp_s;
              }
            } else {
              let has = false;
              em.i_c.have.forEach(function (ch) {
                if (has) return;
                if (arr_enum_c_have.indexOf(ch) >= 0) {
                  has = true;
                }
              });
              if (has) {
                v.i_c = em.i_c.c.replace(reg_key, "<b>$&</b>");
                v.gdc_d = em.gdc_d;
                if (em.term_type) {
                  v.term_type = em.term_type;
                }
                if (v.n == undefined) {
                  v.n = em.n;
                  v.ref = row.ref;
                  v.n_c = em.n_c;
                  v.s = tmp_s;
                }
              } else {
                v.i_c = em.i_c.c;
                v.gdc_d = em.gdc_d;
                if (em.term_type) {
                  v.term_type = em.term_type;
                }
              }
            }
          }

          let lc = em.n.toLowerCase();
          if (lc in matched_pv) {
            if (v.n == undefined) {
              v.n = em.n;
              v.ref = row.ref;
              v.n_c = em.n_c;
              v.s = tmp_s;
            }

            v.cde_s = matched_pv[lc].ss;
            if (v.cde_s.length) {
              v.cde_pv = matched_pv[lc].pv;
              v.cde_pvm = matched_pv[lc].pvm;
            }
            delete matched_pv[lc];

          } else {
            v.cde_s = [];
          }

          if (v.n !== undefined) {
            let tmp = v.n.replace(/<b>/g, "").replace(/<\/b>/g, "");
            row.tgts_enum_n += tmp + "#";
            row.vs.push(v);
          }

        });

        //add the rest of the matched cde_pvs to the subtables
        for (let idx in matched_pv) {
          let v = {};
          v.n = "no match";
          v.ref = row.ref;
          v.n_c = "";
          v.s = [];
          v.cde_s = matched_pv[idx].ss;
          if (v.cde_s.length) {
            v.cde_pv = matched_pv[idx].pv;
            v.cde_pvm = matched_pv[idx].pvm;
          }
          row.vs.push(v);
        }

        //reformat the icd-o-3 code data
        if (row.vs) {
          let temp_i_c = {};
          let new_vs = [];
          row.vs.forEach(function (item) {
            if (item.i_c === undefined) {
              return;
            }
            let item_i_c = item.i_c.replace(/<b>/g, "").replace(/<\/b>/g, "");
            let item_n_clr = item.n.replace(/<b>/g, "").replace(/<\/b>/g, "");
            let tt = item.term_type !== undefined ? item.term_type : "";
            let term_type = "";
            if(tt !== ""){
              term_type = tt === 'PT' ? '<b>(' + tt + ')</b>' :'(' + tt + ')';
            }
            if (item_i_c in temp_i_c && temp_i_c[item_i_c].n.indexOf(item.n) == -1) {
              if(item_n_clr !== item_i_c){
                if(tt === 'PT'){
                  temp_i_c[item_i_c].n.unshift(item.n+" "+term_type);
                }else{
                  temp_i_c[item_i_c].n.push(item.n+" "+term_type);
                }
                temp_i_c[item_i_c].n_clr.push(item_n_clr);
              }
              if (temp_i_c[item_i_c].checker_n_c.indexOf(item.n_c) == -1) {
                temp_i_c[item_i_c].n_syn.push({ n_c: item.n_c, s: item.s });
                temp_i_c[item_i_c].checker_n_c.push(item.n_c);
              }
            } else {
              temp_i_c[item_i_c] = { i_c: item.i_c,n: [], n_clr: [], n_syn: [{ n_c: item.n_c, s: item.s }], checker_n_c: [item.n_c] };
              if(item_n_clr !== item_i_c){
                if(tt === 'PT'){
                  temp_i_c[item_i_c].n.unshift(item.n+" "+term_type);
                }else{
                  temp_i_c[item_i_c].n.push(item.n+" "+term_type);
                }
                temp_i_c[item_i_c].n_clr.push(item_n_clr);
              }
            }
          });
          for (let index_i_c in temp_i_c) {
            source.enum.forEach(function (em) {
              if (em.i_c && em.i_c.c == index_i_c && temp_i_c[index_i_c].n_clr.indexOf(em.n) === -1) {
                let tt = em.term_type !== undefined ? em.term_type : "";
                let term_type = "";
                if(tt !== ""){
                  term_type = tt === 'PT' ? '<b>(' + tt + ')</b>' :'(' + tt + ')';
                }
                if(em.n.replace(/<b>/g, "").replace(/<\/b>/g, "") !== em.i_c.c.replace(/<b>/g, "").replace(/<\/b>/g, "")){
                  if(tt === 'PT'){
                    temp_i_c[index_i_c].n.unshift(em.n + " " + term_type);
                  }else{
                    temp_i_c[index_i_c].n.push(em.n + " " + term_type);
                  }
                }
                if (temp_i_c[index_i_c].checker_n_c.indexOf(em.n_c) == -1) {
                  //remove depulicates in local synonyms
                  let tmp_s = [];
                  let t_s = [];
                  if (em.s) {
                    let cache = {};
                    em.s.forEach(function (s) {
                      let lc = s.trim().toLowerCase();
                      if (!(lc in cache)) {
                        cache[lc] = [];
                      }
                      cache[lc].push(s);
                    });
                    for (let idx in cache) {
                      //find the term with the first character capitalized
                      let word = findWord(cache[idx]);
                      t_s.push(word);
                    }
                    t_s.forEach(function (s) {
                      if (s in dict_enum_s) {
                        exist = true;
                        tmp_s.push(dict_enum_s[s])
                      } else {
                        tmp_s.push(s);
                      }
                    });
                  }
                  temp_i_c[index_i_c].checker_n_c.push(em.n_c);
                  temp_i_c[index_i_c].n_syn.push({n_c: em.n_c, s: tmp_s });
                }
              }
            });
          }
          let check_n = [];
          row.vs.forEach(function (item) {
            //remove if it's not gdc value
            if (item.gdc_d !== undefined && !item.gdc_d) {
              return;
            }
            let item_n = item.n.replace(/<b>/g, "").replace(/<\/b>/g,"");
            if (item_n in temp_i_c) {
              item.term_i_c = temp_i_c[item_n];
              // check_n.push(item_n);
            }
            if (item.i_c !== undefined) {
              let item_i_c = item.i_c.replace(/<b>/g, "").replace(/<\/b>/g, "");
              if (check_n.indexOf(item_i_c) !== -1) {
                return;
              }else{
                check_n.push(item_n);
              }
              if (item_i_c in temp_i_c) {
                item.term_i_c = temp_i_c[item_i_c];
              }
            }
            if (item.temp_i_c && item.temp_i_c.checker_n_c) {
              delete item.term_i_c.checker_n_c;
            }
            if (item.term_i_c && item.term_i_c.n_clr) {
              delete item.term_i_c.n_clr
            }
            new_vs.push(item)
          });

          //add the reformated to vs values
          row.vs = new_vs;
        }
        len += row.vs.length;
      }else{
        // if it doesn't have any enums and matches with cde_ss
        if(!_.isEmpty(matched_pv)){
          for (let idx in matched_pv) {
            let v = {};
            v.n = "no match";
            v.ref = row.ref;
            v.n_c = "";
            v.s = [];
            v.cde_s = matched_pv[idx].ss;
            if (v.cde_s.length) {
              v.cde_pv = matched_pv[idx].pv;
              v.cde_pvm = matched_pv[idx].pvm;
            }
            row.vs.push(v);
          }
          len += row.vs.length;
        }

      }
      if (row.vs.length !== 0) {
        values.push(row);
      }
    });
    let html = "";
    let searched_keyword = $("#keywords").val();
    if (values.length == 0 || (values.length === 1 && values[0].vs.length === 0)) {
      html =
        '<div class="indicator">Sorry, no results found for keyword: <span class="indicator__term">' +
        searched_keyword + '</span></div>';
    } else {
      let offset = $('#root').offset().top;
      let h = window.innerHeight - offset - 310;
      options.height = (h < 430) ? 430 : h;
      options.keyword = searched_keyword;
      html = $.templates({
        markup: tmpl,
        allowCode: true
      }).render({
        options: options,
        values: values
      });
    }
    let result = {};
    result.len = len;
    result.html = html;
    return result;

  }
};
export default func;
