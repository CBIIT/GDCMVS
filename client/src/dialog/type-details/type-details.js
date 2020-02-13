
import { headerTemplate, bodyTemplate } from './type-details-view';
import { getHeaderOffset, getScrollTop } from '../../shared';

const typeDetails = () => {
  if ($('#type_details').length) {
    $('#type_details').remove();
  }

  $(document.body).append(bodyTemplate);

  $('#type_details').dialog({
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

      $('#close_type_details').bind('click', function () {
        $('#type_details').dialog('close');
      });
    },
    close: function () {
      $(this).remove();
    }
  }).parent().draggable({
    containment: '#docs-container'
  });
};

export default typeDetails;
