import tmpl from './view';

const func = {
  render(items, keyword, search_option) {
    //data preprocessing
    let props = [];
    //options render
    let options = {};
    // RegExp Keyword
    keyword = keyword.trim().replace(/[\ ,:_-]+/g, " ");
    let reg_key = new RegExp(keyword, "ig");

    items.forEach(function (item) {
      let hl = item.highlight;
      let source = item._source;
      if (("name" in hl) || ("name.have" in hl) || ("desc" in hl) || ("cde.id" in hl)) {
        let prop = {};
        prop.nm = ("name" in hl) || ("name.have" in hl) ? (hl["name"] || hl["name.have"]) : [source.name];
        let cde_id = ("cde.id" in hl) ? hl["cde.id"] : [];
        let dict_cde_id = {};
        cde_id.forEach(function (pn) {
          let tmp = pn.replace(/<b>/g, "").replace(/<\/b>/g, "");
          dict_cde_id[tmp] = pn;
        });
        prop.nm_link = prop.nm[0].replace(/<b>/g, "").replace(/<\/b>/g, "");
        if (keyword.indexOf(' ') === -1) {
          prop.nm[0] = prop.nm[0].replace(/<b>/g, "").replace(/<\/b>/g, "").replace(reg_key, "<b>$&</b>");
        }
        prop.nd = source.node;
        prop.ct = source.category;
        prop.desc = ("desc" in hl) ? hl["desc"] : [source.desc];
        if (prop.desc[0] !== undefined && keyword.indexOf(' ') === -1 && "desc" in hl) {
          prop.desc[0] = prop.desc[0].replace(/<b>/g, "").replace(/<\/b>/g, "").replace(reg_key, "<b>$&</b>");
        }
        prop.local = source.enum == undefined ? false : true;
        prop.syn = false;
        if (source.enum !== undefined) {
          //check if synonyms exists
          source.enum.forEach(function (em) {
            if (prop.syn) return;

            if (em.n_c !== undefined) {
              prop.syn = true;
            }
          });
        }
        prop.ref = source.name + "@" + source.node + "@" + source.category;
        prop.cdeId = source.cde !== undefined ? source.cde.id : "";
        if(prop.cdeId in dict_cde_id){
          prop.cdeId = dict_cde_id[prop.cdeId];
        }
        prop.cdeUrl = source.cde !== undefined ? source.cde.url : "";
        prop.cdeLen = source.cde_pv == undefined || source.cde_pv.length == 0 ? false : true;
        prop.type = Array.isArray(source.type) ? source.type[0] : source.type;
        if (source.cde !== undefined && source.cde.dt !== undefined) {
          prop.type = source.cde.dt;
        }
        if (prop.type) {
          prop.type = prop.type.toLowerCase();
        }
        props.push(prop);
      }
    });
    let html = "";
    if (props.length == 0) {
      let keyword = $("#keywords").val();
      html = '<div class="indicator">Sorry, no results found for keyword: <span class="indicator__term">' + keyword + '</span></div>';
    }
    else {
      let offset = $('#root').offset().top;
      let h = window.innerHeight - offset - 310;
      options.height = (h < 430) ? 430 : h;
      options.redirect = false;
      if (window.location.href.indexOf('https://docs.gdc.cancer.gov/') < 0) {
        options.redirect = true;
      }
      html = $.templates(tmpl).render({ options: options, props: props });
    }

    let result = {};
    result.len = props.length;
    result.html = html;
    return result;

  }
};

export default func;
