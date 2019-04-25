// import tmpl from './ncit-details.html';
import { header_template, body_template } from './ncit-details-view';
import { apiEVSRest } from '../../api';
import { getHeaderOffset, getScrollTop, htmlChildContent } from '../../shared';

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
    tmp.s = item.synonyms;

    //let header_template = htmlChildContent('HeaderTemplate', tmpl);
    //let body_template = htmlChildContent('BodyTemplate', tmpl);

    let header = header_template;
    let html = body_template(tmp);

    $(document.body).append(html);

    $('#ncit_details').dialog({
      modal: false,
      width: 600,
      height: 600,
      minWidth: 420,
      maxWidth: 800,
      minHeight: 350,
      maxHeight: 650,
      open: function () {
        //add new custom header
        $(this).prev('.ui-dialog-titlebar').css('padding-top', '3.5em').html(header);

        let target = $(this).parent();
        if ((target.offset().top - getScrollTop()) < getHeaderOffset()) {
          target.css('top', (getScrollTop() + getHeaderOffset() + 10) + 'px');
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
