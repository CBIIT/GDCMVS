import { headerTemplate, bodyTemplate } from './source-details-view';
import { getHeaderOffset, getScrollTop } from '../../shared';

const sourceDetails = () => {
  if ($('#source_details').length) {
    $('#source_details').remove();
  }

  $(document.body).append(bodyTemplate);

  $('#source_details').dialog({
    modal: false,
    width: 600,
    height: 600,
    minWidth: 500,
    maxWidth: 800,
    minHeight: 400,
    maxHeight: 650,
    open: function () {
      // add new custom header
      $(this).prev('.ui-dialog-titlebar').css('padding-top', '3.5em').html(headerTemplate);

      let target = $(this).parent();
      if ((target.offset().top - getScrollTop()) < getHeaderOffset()) {
        target.css('top', (getScrollTop() + getHeaderOffset() + 10) + 'px');
      }

      $('#close_source_details').bind('click', function () {
        $('#source_details').dialog('close');
      });
    },
    close: function () {
      $(this).remove();
    }
  }).parent().draggable({
    containment: '#docs-container'
  });
};

export default sourceDetails;
