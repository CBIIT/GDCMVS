import tmpl from './tabs.html';

export default (trsHtml, psHtml, vsHtml, keyword) => {

  let html = $.templates(tmpl).render({
    trs_active: trsHtml.active,
    trs_len: trsHtml.len,
    trsHtml: trsHtml.html,
    ps_active: psHtml.active,
    ps_len: psHtml.len,
    psHtml: psHtml.html,
    vs_active: vsHtml.active,
    vs_len: vsHtml.len,
    vsHtml: vsHtml.html,
    keyword: keyword
  });

  return html;
}
