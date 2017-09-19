import tmpl from './view';

export default function (trsRender, psRender, vsRender) {

  let html = $.templates(tmpl).render();

  return html;
}
