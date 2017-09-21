import tmpl from './view';

export default function (trsHtml, psHtml, vsHtml) {

  let html = $.templates(tmpl).render({trsHtml: trsHtml.html, ps_len: psHtml.len, psHtml: psHtml.html, vs_len: vsHtml.len, vsHtml: vsHtml.html});

  return html;
}
