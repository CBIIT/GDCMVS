import { dtRender} from './dict-table/dict-table';
import psRender from './props-table/props-table';
import { vsRender } from './values-table/values-table';
import { tabsRender } from './tabs/tabs'
import { getHeaderOffset } from './shared'

export default function render($root, keyword, option, items) {
  let html = "";
  if (items.length !== 0) {
    //deep copy for items array for each tab
    let data1 = JSON.parse(JSON.stringify(items));
    let data2 = JSON.parse(JSON.stringify(items));
    let data3 = JSON.parse(JSON.stringify(items));
    //render each tab
    let dtHtml = dtRender(data1, keyword);
    dtHtml.active = false;
    let psHtml = psRender(data2, keyword);
    psHtml.active = false;
    let vsHtml = vsRender(data3, keyword);
    vsHtml.active = false;
    if (vsHtml.len === 0 && psHtml.len === 0) {
      trsHtml.len = 0;
    }
    if (trsHtml.len === 0 && psHtml.len === 0 && vsHtml.len === 0) {
      html = '<div class="indicator">Sorry, no results found for keyword: <span class="indicator__term">' + keyword + '</span></div>';
    } else {
      if (option.activeTab == 0) {
        vsHtml.active = true;
      } else if (option.activeTab == 1) {
        psHtml.active = true;
      } else {
        dtHtml.active = true;
      }
      html = tabsRender(dtHtml, psHtml, vsHtml, keyword);
    }
  } else if (option.error == true) {
    html = '<div class="indicator indicator--has-error">Please, enter a valid keyword!</div>';
  } else {
    html = '<div class="indicator">Sorry, no results found for keyword: <span class="indicator__term">' + keyword + '</span></div>';
  }

  $root.html(html);
}
