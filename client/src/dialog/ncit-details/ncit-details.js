import tmpl from './ncit-details.html';
import { apiEVSRest } from '../../api';
import { getHeaderOffset, htmlChildContent, findCapitalWord } from '../../shared';

export default function ncitDetails(uid){
  uid = uid.replace(/<b>/g, "").replace(/<\/b>/g, "");
  apiEVSRest(uid, function (id, item) {

    if ($('#ncit_details').length) {
      $('#ncit_details').remove();
    }

    let tmp = {};
    tmp.code = item.code;
    tmp.name = item.preferredName
    tmp.definition = item.definitions.length ? item.definitions.find(function (defs) { return defs.defSource === 'NCI' }).description : undefined;
    tmp.synonyms = item.synonyms;

    // //remove the duplicate
    // let cache = {};
    // if (tmp_s.length > 0) {
    //   tmp_s.forEach(function (s) {
    //     let lc = s.termName.trim().toLowerCase();
    //     if(cache[lc] === undefined){
    //       cache[lc] = [];
    //     }
    //     cache[lc].push(s);
    //   });
    //   for (let idx in cache) {
    //     //find the term with the first character capitalized
    //     let word = findCapitalWord(cache[idx]);
    //     tmp.synonyms.push(word);
    //   }
    // }

    let windowEl = $(window);
    let header_template = htmlChildContent('HeaderTemplate', tmpl);
    let body_template = htmlChildContent('BodyTemplate', tmpl);
    let tp = (window.innerHeight * 0.2 < getHeaderOffset()) ? getHeaderOffset() + 20 : window.innerHeight * 0.2;
    let header = $.templates(header_template).render();
    let html = $.templates(body_template).render({ item: tmp });

    $(document.body).append(html);

    $('#ncit_details').dialog({
      modal: false,
      position: { my: "center top+" + tp, at: "center top", of: $('#docs-container') },
      width: 600,
      height: 450,
      minWidth: 420,
      maxWidth: 800,
      minHeight: 350,
      maxHeight: 650,
      open: function () {
        //add new custom header
        $(this).prev('.ui-dialog-titlebar').css('padding-top', '3.5em').html(header);

        var target = $(this).parent();
        target.find('.ui-dialog-titlebar-close').html('');
        if ((target.offset().top - windowEl.scrollTop()) < getHeaderOffset()) {
          target.css('top', (windowEl.scrollTop() + getHeaderOffset() + 20) + 'px');
        }

        $('#close_ncit_details').bind('click', function () {
          $("#ncit_details").dialog('close');
        });
      },
      close: function () {
        $(this).remove();
      }
    }).parent().draggable({
      containment: '#docs-container'
    });
  });
}
