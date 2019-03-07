import tmpl from './tabs.html';

const storageTabHandle = (valueTab) => {
  const option = JSON.parse(localStorage.getItem('option'));
  option.activeTab = valueTab;
  localStorage.setItem('option', JSON.stringify(option));
}

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

export const tabsEvents = ($root) => {
  $root.on('click', '#tab-values', () => {
    storageTabHandle(0);
  });

  $root.on('click', '#tab-properties', () => {
    storageTabHandle(1);
  });

  $root.on('click', '#tab-dictionary', () => {
    storageTabHandle(2);
  });

  $root.tooltip({
    selector: '[data-toggle="tooltip"]',
    delay: {'show': 100, 'hide': 50},
    placement: 'bottom',
    trigger: 'hover'
  });
}
