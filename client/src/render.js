import { apiSuggestMisSpelled } from './api';
import { dtRender} from './dict-table/dict-table';
import psRender from './props-table/props-table';
import { vsRender } from './values-table/values-table';
import { tabsRender } from './tabs/tabs';
import { getHeaderOffset } from './shared';

export default function render($root, keyword, option, items) {
  let html = "";
  if (items.length !== 0) {
    //deep copy for items array for each tab
    let data1 = JSON.parse(JSON.stringify(items));
    let data2 = JSON.parse(JSON.stringify(items));
    let data3 = JSON.parse(JSON.stringify(items));
    //render each tab
    let dtHtml = dtRender(data1, keyword, option);
    dtHtml.active = false;
    let psHtml = psRender(data2, keyword, option);
    psHtml.active = false;
    let vsHtml = vsRender(data3, keyword, option);
    vsHtml.active = false;
    if (vsHtml.len === 0 && psHtml.len === 0) {
      dtHtml.len = 0;
    }
    if (dtHtml.len === 0 && psHtml.len === 0 && vsHtml.len === 0) {
      html = `<div class="indicator">
        <div class="indicator__content">
          <p>Sorry, no results found for keyword: <span class="indicator__term">${keyword}</span></p>
          <div class="indicator__card">
            <div class="indicator__suggestion">
              <p class="indicator__suggestion-p">Suggestion:</p>
              <ul>
                <li>Make sure all words are spelled correctly.</li>
                <li>Try different keywords.</li>
                <li>Try more general keywords.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>`
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
    html = `<div class="indicator">
      <div class="indicator__content indicator--has-error">
        <p>Please, enter a valid keyword!</p>
      </div>
    </div>`;
  } else {

    apiSuggestMisSpelled(keyword, (results) => {
      html = `<div class="indicator">
        <div class="indicator__content">
          <p>Sorry, no results found for keyword: <span class="indicator__term">${keyword}</span></p>
          <div class="indicator__card">
          ${results.length !== 0 ? `<p class="indicator__mean">
            <span class="indicator__mean-span">Did you mean:</span><br>
            ${results.map((result, index) => `
              ${index !== 0 ? `,` : '' }
              <a href="#" class="indicator__suggest-term">${result.id}</a>
            `.trim()).join('')}<p>` : '' }
            <div class="indicator__suggestion">
              <p class="indicator__suggestion-p">Suggestion:</p>
              <ul>
                <li>Make sure all words are spelled correctly.</li>
                <li>Try different keywords.</li>
                <li>Try more general keywords.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>`

      $root.html(html);

      $('.indicator__suggest-term').click(function (event) {
        event.preventDefault();
        $("#keywords").val(this.innerText);
        $("#search").trigger("click");
      });

    });
  }

  $root.html(html);
}
