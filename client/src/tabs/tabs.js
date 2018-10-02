import tmpl from './tabs.html';

export const tabsRender = (trsHtml, psHtml, vsHtml, keyword) => {

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

export const tabsEvents = () => {
  $('#tab-values').bind('click', function () {
    let option = JSON.parse(localStorage.getItem('option'));
    option.activeTab = 0;
    localStorage.setItem('option', JSON.stringify(option));
  });

  $('#tab-properties').bind('click', function () {
    let option = JSON.parse(localStorage.getItem('option'));
    option.activeTab = 1;
    localStorage.setItem('option', JSON.stringify(option));
  });

  $('#tab-dictionary').bind('click', function () {
    let option = JSON.parse(localStorage.getItem('option'));
    option.activeTab = 2;
    localStorage.setItem('option', JSON.stringify(option));
  });
}
