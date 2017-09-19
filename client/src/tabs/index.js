import tmpl from './view';

export default function (trsHtml, psHtml, vsHtml) {

  let html = $.templates(tmpl).render({trsHtml: trsHtml, psHtml: psHtml, vsHtml: vsHtml});

  return html;
}
