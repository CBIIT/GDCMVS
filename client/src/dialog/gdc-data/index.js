import tmpl from './view';
import api from '../../api';
import shared from '../../shared';

export default function gdcData(prop, item) {
  api.getGDCDataById(prop, function(id, items) {

    if($('#gdc_data').length){
      $('#gdc_data').remove();
    }

    let windowEl = $(window);
    let icdo = false;
    let icdo_items = [];

    items.forEach(function(item){
      if(item.i_c !== undefined){
        icdo = true;
        icdo_items.push(item);
      }
    });

    if(icdo){
      items = icdo_items;
    }

    let target = item == undefined ? item : item.replace(/<b>/g,"").replace(/<\/b>/g, "");
    let header = $.templates(tmpl.header).render({target: target, icdo: icdo, items_length: items.length});
    let html = $.templates(tmpl.body).render({target: target, icdo: icdo, items: items});

    let tp = (window.innerHeight * 0.2 < shared.headerOffset() )? 20 : window.innerHeight * 0.2;

    //display result in a table
    $(document.body).append(html);

    $('#gdc_data').dialog({
      modal: false,
      position: { my: 'center top+'+tp, at: 'center top', of:$('#docs-container')},
      width: 600,
      height: 450,
      minWidth: 420,
      maxWidth: 800,
      minHeight: 350,
      maxHeight: 650,
      open: function() {
        //add new custom header
        if(icdo) {
          $(this).prev('.ui-dialog-titlebar').css('padding-top', '7.5em').html(header);
        } else {
          $(this).prev('.ui-dialog-titlebar').css('padding-top', '3.5em').html(header);
        }

        var target = $(this).parent();
        if((target.offset().top - windowEl.scrollTop()) < shared.headerOffset()){
          target.css('top', (windowEl.scrollTop() + shared.headerOffset() + 20)+'px');

        }

        $('#close_gdc_data').bind('click', function(){
          $("#gdc_data").dialog('close');
        });
      },
      close: function() {
        $(this).remove();
      }
    }).parent().draggable({
      containment: '#docs-container'
    });

    if($('#show_all_gdc_data') !== undefined){
      $('#show_all_gdc_data').bind('click', function(){
        let v = $(this).prop("checked");
        if(v){
          $('#gdc-data-list div[style="display: none;"]').each(function(){
            $(this).css("display","block");
          });
          var setScroll = $('#gdc_data_match').offset().top - $('#gdc_data').offset().top;
          $('#gdc_data').scrollTop(setScroll - 120);
        } else {
          $('#gdc-data-list div[style="display: block;"]').each(function(){
            $(this).css("display","none");
          });
        }
      });
    }

  });
}
