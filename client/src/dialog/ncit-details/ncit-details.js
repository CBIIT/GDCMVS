import { headerTemplate, bodyTemplate } from './ncit-details-view';
import { apiEVSRest } from '../../api';
import { getHeaderOffset, getScrollTop, sortSynonyms } from '../../shared';

const ncitDetails = (uid) => {
  uid = uid.replace(/<b>/g, '').replace(/<\/b>/g, '');
  apiEVSRest(uid, function (id, item) {
    if ($('#ncit_details').length) {
      $('#ncit_details').remove();
    }

    let tmp = {};
    let sym = [];
    tmp.code = item.code;
    tmp.name = item.preferredName;
    tmp.definition = item.defs.length ? item.defs.find(function (defs) { return defs.defSource === 'NCI'; }).description : undefined;
    sym = item.syns.filter(s => s.termSource === 'NCI');
    tmp.s = sortSynonyms(sym);
    tmp.ap = item.aprop;

    let header = headerTemplate;
    let html = bodyTemplate(tmp);

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
        // add new custom header
        $(this).prev('.ui-dialog-titlebar').css('padding-top', '3.5em').html(header);

        let target = $(this).parent();
        if ((target.offset().top - getScrollTop()) < getHeaderOffset()) {
          target.css('top', (getScrollTop() + getHeaderOffset() + 10) + 'px');
        }

        $('#close_ncit_details').bind('click', function () {
          $('#ncit_details').dialog('close');
        });
      },
      close: function () {
        $(this).remove();
      }
    }).parent().draggable({
      containment: '#docs-container'
    });
  });
};

export default ncitDetails;
