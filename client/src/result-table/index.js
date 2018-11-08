import tmpl from './view';

const func = {
  render(items, keyword, search_option) {
    //data preprocessing
    //current category
    let c_c = "";
    //current node
    let c_n = "";
    //prefix for property and value id
    let count = 0;
    //data generated
    let trs = [];

    //category row
    let c = {};
    //node row
    let n = {};
    //final result
    let result = {};
    result.len = 0;
    //options render
    let options = {};
    // RegExp Keyword
    keyword = keyword.trim().replace(/[\ ,:_-]+/g, " ");
    let reg_key = new RegExp(keyword, "ig");
    let gdc_p = [];

    items.forEach(function (item) {
      let hl = item.highlight;
      let source = item._source;
      let enum_s = ("enum.s" in hl) || ("enum.s.have" in hl) ? hl[
        'enum.s'] || hl["enum.s.have"] : [];
      let enum_n = ("enum.n" in hl) || ("enum.n.have" in hl) ? hl[
        "enum.n"] || hl["enum.n.have"] : [];
      let enum_gdc_n = [];
      enum_n.forEach(function (n) {
        let tmp = n.replace(/<b>/g, "").replace(/<\/b>/g, "");
        source.enum.forEach(function (em) {
          if (em.n === tmp && em.gdc_d === true) {
            enum_gdc_n.push(n);
          }
        });
      });
      let prop = ("name" in hl) || ("name.have" in hl) ?
        hl["name"] || hl["name.have"] : [];
      let desc = ("desc" in hl) ? hl["desc"] : [];
      let enum_i_c = ("enum.i_c.c" in hl) || ("enum.i_c.have" in hl) ?
        hl["enum.i_c.c"] || hl["enum.i_c.have"] : [];
      let enum_s_icdo3 = [];
      if (enum_s.length === 0 && enum_gdc_n.length === 0) {
        enum_s_icdo3 = ("enum" in item._source) ? item._source["enum"] : [];
      }
      let cde_n = ("cde_pv.n" in hl) || ("cde_pv.n.have" in hl) ? hl[
        "cde_pv.n"] || hl["cde_pv.n.have"] : [];
      let cde_s = ("cde_pv.ss.s" in hl) || ("cde_pv.ss.s.have" in hl) ?
        hl["cde_pv.ss.s"] || hl["cde_pv.ss.s.have"] : [];
      let arr_enum_s = [];
      let arr_enum_i_c = [];
      let arr_enum_s_icdo3 = [];
      let arr_enum_n = [];
      let arr_cde_n = [];
      let arr_cde_s = [];
      let matched_pv = [];
      let gdc_desc = {};

      if (enum_s_icdo3.length > 0) {
        enum_s_icdo3.forEach(function (s) {
          if (s.gdc_d === true) {
            arr_enum_s_icdo3.push(s.n);
          }
        })
      }
      desc.forEach(function (d){
        if(gdc_p.indexOf(source.name) !== -1) return;
        gdc_p.push(source.name);
      });
      prop.forEach(function (p){
        gdc_p.push(p.replace(/<b>/g, "").replace(/<\/b>/g, ""));
      });
      enum_s.forEach(function (s) {
        let tmp = s.replace(/<b>/g, "").replace(/<\/b>/g, "");
        arr_enum_s.push(tmp);
      });
      enum_gdc_n.forEach(function (n) {
        let tmp = n.replace(/<b>/g, "").replace(/<\/b>/g, "");
        arr_enum_n.push(tmp);
      });
      enum_i_c.forEach(function (i_c) {
        let tmp = i_c.replace(/<b>/g, "").replace(/<\/b>/g, "");
        if (arr_enum_n.indexOf(tmp) === -1) {
          arr_enum_i_c.push(tmp);
        }
      });
      cde_n.forEach(function (pn) {
        let tmp = pn.replace(/<b>/g, "").replace(/<\/b>/g, "");
        arr_cde_n.push(tmp);
      });
      cde_s.forEach(function (ps) {
        let tmp = ps.replace(/<b>/g, "").replace(/<\/b>/g, "");
        arr_cde_s.push(tmp);
      });
      if (source.cde_pv !== undefined && source.cde_pv.length > 0) {
        source.cde_pv.forEach(function (pv) {
          let exist = false;
          if (pv.ss !== undefined && pv.ss.length > 0) {
            pv.ss.forEach(function (ss) {
              ss.s.forEach(function (s) {
                if (arr_cde_s.indexOf(s) !== -1) {
                  exist = true;
                }
              })
            });
          }
          exist = exist || (arr_cde_n.indexOf(pv.n) >= 0);
          if (exist && matched_pv.indexOf(pv.n.toLowerCase()) === -1) {
            matched_pv.push(pv.n.toLowerCase());
          }
        });
      }

      if (source.category != c_c) {
        //put category to tree table
        count++;
        c_c = source.category;
        c = {};
        c.id = c_c;
        c.title = c_c;
        c.desc = "";
        c.data_tt_id = count + "_" + c.id;
        c.data_tt_parent_id = "--";
        c.type = "category";
        c.node = "branch";
        c.exist = true;
        c.len = 0;
        trs.push(c);
      }
      if (source.node != c_n) {
        //put node to tree table
        count++;
        c_n = source.node;
        n = {};
        //link id
        n.l_id = source.node;
        n.id = source.node;
        n.title = source.n_title;
        n.desc = source.n_desc;
        n.data_tt_id = count + "_" + n.id;
        n.data_tt_parent_id = c.data_tt_id;
        n.type = "folder";
        n.node = "branch";
        n.exist = true;
        n.len = 0;
        trs.push(n);
      }
      //put property to tree table
      let p = {};
      //calculate if property itself got matched;
      let count_p = 0;
      //calculate how many values got matched in this property;
      let count_v = 0;
      //calculate how many synonyms got matched in this property
      let count_s = 0;
      count++;
      p.id = count + "_" + source.name;
      //link id
      p.l_id = source.name;
      p.parent_l_id = n.l_id;
      //may have highlighted terms in p.title and p.desc
      p.title = ("name" in hl) || ("name.have" in hl) ? (hl["name"] || hl[
        "name.have"]) : [source.name];
      p.desc = ("desc" in hl) ? hl["desc"] : [source.desc];
      if (p.title[0] !== undefined && keyword.indexOf(' ') === -1) {
        p.title[0] = p.title[0].replace(/<b>/g, "").replace(/<\/b>/g, "").replace(reg_key, "<b>$&</b>");

      }
      if(p.desc[0] !== undefined && keyword.indexOf(' ') === -1 && "desc" in hl){
        p.desc[0] = p.desc[0].replace(/<b>/g, "").replace(/<\/b>/g, "").replace(reg_key, "<b>$&</b>");
      }
      p.data_tt_id = p.id;
      p.data_tt_parent_id = n.data_tt_id;
      p.type = "property";
      p.exist = true;
      if (("name" in hl) || ("name.have" in hl) || ("desc" in hl)) {
        count_p = 1;
      }
      //put value to tree table
      if (source.enum != undefined) {
        if (enum_gdc_n.length == 0 &&
          enum_i_c.length == 0 &&
          matched_pv.length == 0 &&
          arr_enum_s.length == 0) {
          //if no values show in the values tab
          p.node = "branch";
          if (p.title && gdc_p.indexOf(p.title[0].replace(/<b>/g, "").replace(/<\/b>/g, "")) !== -1) {
            trs.push(p);
          }
          // if (arr_enum_s_icdo3.length > 0) {
            arr_enum_s_icdo3.sort();
            source.enum.forEach(function (s_i) {
              if(s_i.gdc_d === false) return;
              let tmp_e = {};
              //count++;
              tmp_e.title = s_i.n;
              tmp_e.desc = "";
              tmp_e.data_tt_id = count + "_" + s_i.n;
              tmp_e.data_tt_parent_id = p.id;
              tmp_e.type = "value";
              tmp_e.node = "leaf";
              tmp_e.exist = false;
              trs.push(tmp_e);
            });
          // }
        } else {
          p.node = "branch";
          trs.push(p);
          //show values, need to highlight if necessary
          let list = [];
          if (("enum.n" in hl) || ("enum.n.have" in hl)) {
            list = hl["enum.n"] || hl["enum.n.have"];
          }
          let enums = {};
          list.forEach(function (em) {
            let e = em.replace(/<b>/g, "").replace(/<\/b>/g, "");
            if (keyword.indexOf(' ') === -1) {
              enums[e] = em.replace(/<b>/g, "").replace(/<\/b>/g, "").replace(reg_key, "<b>$&</b>");;
            }else{
              enums[e] = em;
            }
          });
          let values = source.enum;
          let tmp_trs = [];
          let tmp_checker_n = [];
          values.forEach(function (v) {
            if (v.gdc_d !== undefined && !v.gdc_d) {
              return;
            }
            count++;
            let e = {};
            e.id = count + "_" + v.n;
            e.exist = false;

            let idx = matched_pv.indexOf(v.n.toLowerCase());
            if (idx !== -1) {
              count_s--;
              e.exist = true;
            } else {

              if (arr_enum_n.indexOf(v.n) !== -1) {
                e.exist = true;
              }

              if (v.i_c !== undefined && e.exist !== true) {
                v.i_c.have.forEach(function (v_i_c_have) {
                  if (arr_enum_i_c.indexOf(v_i_c_have) !== -1 &&
                    arr_enum_n.length === 0) {
                    e.exist = true;
                  }
                });
              }

              if (v.s !== undefined && e.exist !== true) {
                v.s.forEach(function (syn) {
                  if (arr_enum_s.indexOf(syn) !== -1) {
                    e.exist = true;
                  }
                });
              }
            }

            //may be highlighted
            e.title = (v.n in enums) ? enums[v.n] : v.n;
            e.desc = "";
            e.data_tt_id = e.id;
            e.data_tt_parent_id = p.id;
            e.type = "value";
            e.node = "leaf";
            if(tmp_checker_n.indexOf(e.title) == -1){
              if (e.exist) {
                count_v++;
                tmp_checker_n.push(e.title);
              }
              tmp_trs.push(e);
            }
          });
          if (count_v == 0) {
            p.node = "";
            tmp_trs.forEach(function (tt) {
              trs.push(tt);
            });
            if(p.title && gdc_p.indexOf(p.title[0].replace(/<b>/g, "").replace(/<\/b>/g, "")) === -1){
              if(enum_gdc_n.length === 0 && matched_pv.length === 0) return;
              let l = {};
              l.id = count + "_l";
              l.l_id = source.cde.id;
              l.l_type = "cde";
              l.url = source.cde.url;
              l.desc = "";
              l.data_tt_id = l.id;
              l.data_tt_parent_id = p.id;
              l.type = "link";
              l.node = "leaf";
              trs.push(l);
            }
          } else {
            tmp_trs.forEach(function (tt) {
              trs.push(tt);
            });
          }
          count_s += matched_pv.length;
        }
      } else {
        if (matched_pv.length > 0) {
          //matched on cde
          p.node = "branch";
          trs.push(p);
          //show caDSR reference
          count++;
          let l = {};
          l.id = count + "_l";
          l.l_id = source.cde.id;
          l.l_type = "cde";
          l.url = source.cde.url;
          l.desc = "";
          l.data_tt_id = l.id;
          l.data_tt_parent_id = p.id;
          l.type = "link";
          l.node = "leaf";
          trs.push(l);

          count_s = matched_pv.length;
        } else {
          //matched on property name or description
          p.node = "";
          trs.push(p);
        }
      }

      //save and calculate the count of matched element in this property
      p.len = count_v + count_s;
      c.len += p.len + count_p;
      n.len += p.len + count_p;
      result.len += p.len + count_p;
    });
    let newtrs = [];
    trs.forEach(function (data) {
      let temp_categ = {
        nodes: []
      };
      if (data.type == "category") {
        temp_categ.title = data.title;
        temp_categ.type = "category";
        temp_categ.len = data.len;
        temp_categ.id = data.id;

        trs.forEach(function (data1) {
          if (data1.type == "folder" && data1.data_tt_parent_id ===
            data.data_tt_id) {
            let temp_node = {};
            temp_node.title = data1.title;
            temp_node.desc = data1.desc;
            temp_node.len = data1.len;
            temp_node.type = data1.type;
            temp_node.l_id = data1.l_id;
            temp_node.properties = [];

            trs.forEach(function (data2) {
              if (data2.type === "property" && data2.data_tt_parent_id ===
                data1.data_tt_id) {
                let temp_prop = {};
                temp_prop.title = data2.title;
                temp_prop.desc = data2.desc;
                temp_prop.len = data2.len;
                temp_prop.type = data2.type;
                temp_prop.parent_l_id = data2.parent_l_id;
                temp_prop.l_id = data2.l_id;
                temp_prop.hl_values = [];
                temp_prop.all_values = [];
                temp_prop.link_values = [];

                trs.forEach(function (data3) {
                  if (data3.type === "value" && data3.data_tt_parent_id ===
                    data2.data_tt_id) {
                    let temp_value = {};
                    temp_value.title = data3.title;
                    temp_value.type = data3.type;
                    temp_prop.all_values.push(temp_value);
                    if (data3.exist) {
                      temp_prop.hl_values.push(temp_value);
                    }
                  }
                  if (data3.type === "link" && data3.data_tt_parent_id ===
                    data2.data_tt_id) {
                    let temp_value = {};
                    temp_value.url = data3.url;
                    temp_value.type = data3.type;
                    temp_value.l_id = data3.l_id;
                    temp_value.l_type = data3.l_type;
                    temp_prop.link_values.push(temp_value);
                  }
                });
                  // if(gdc_p.indexOf(temp_prop.title[0].replace(/<b>/g, "").replace(/<\/b>/g, "")) === -1 && temp_prop.hl_values.length === 0 && temp_prop.link_values.length === 0){
                  //   return;
                  // }
                temp_node.properties.push(temp_prop);
              }
            });
            temp_categ.nodes.push(temp_node);
          }
        });
        newtrs.push(temp_categ);
      }
    });
    let offset = $('#root').offset().top;
    let h = window.innerHeight - offset - 313;
    options.height = (h < 430) ? 430 : h;
    options.redirect = false;
    if (window.location.href.indexOf('https://docs.gdc.cancer.gov/') < 0) {
      options.redirect = true;
    }
    let html = $.templates(tmpl).render({
      options: options,
      newtrs: newtrs
    });
    result.html = html;
    return result;
  }
};

export default func;
