import tmpl from './view';
import api from '../../api';
import shared from '../../shared';

export default function getGDCTerms(uid, tgts){
  api.getGDCDataById(uid, function(id, items){
    if($('#gdc_terms_data').length){
        $('#gdc_terms_data').remove();
    }

    let targets = null;
    let icdo = false;
    let windowEl = $(window);

    if(tgts !== null && tgts !== undefined){
      targets = tgts.split("#");

      items.forEach(function(item){
        if(item.i_c !== undefined){
          icdo = true;
        }
        if (targets.indexOf(item.n) > -1){
          item.e = true;
        }
      });
    } else{
      items.forEach(function(item){
        if(item.i_c !== undefined){
          icdo = true;
        }
      });
    }

    items.forEach(function(it){
      if(it.s == undefined) return;
      let cache = {};
      let tmp_s = [];
      it.s.forEach(function(s){
        let lc = s.trim().toLowerCase();
        if(!(lc in cache)){
          cache[lc] = [];
        }
        cache[lc].push(s);
      });
      for(let idx in cache){
        //find the term with the first character capitalized
        let word = findWord(cache[idx]);
        tmp_s.push(word);
      }
      it.s_r = tmp_s;
    });

    let header = $.templates(tmpl.header).render({targets: targets, icdo: icdo, items_length: items.length })
    let html = $.templates({markup: tmpl.body, allowCode: true}).render({targets: targets, icdo: icdo, items: items });
    let tp = (window.innerHeight * 0.2 < shared.headerOffset() )? shared.headerOffset() + 20 : window.innerHeight * 0.2;

    //display result in a table
    $(document.body).append(html);

    $("#gdc_terms_data").dialog({
      modal: false,
      position: { my: "center top+"+tp, at: "center top", of:$('#docs-container')},
      width: 900,
      height: 'auto',
      minWidth: 700,
      maxWidth: 1000,
      minHeight: 300,
      maxHeight: 600,
      open: function() {
        //add new custom header
        $(this).prev('.ui-dialog-titlebar').css('padding-top', '7.5em').html(header);

        // $(this).prev('.ui-dialog-titlebar').remove();
        // $(this).before(header);
        //$(this).before(header);
        var target = $(this).parent();

        // target.find('.ui-dialog-titlebar').append(titleComponent);
        // target.find('.ui-dialog-titlebar-close').html('');

        if((target.offset().top - windowEl.scrollTop()) < shared.headerOffset()){
            target.css('top', (windowEl.scrollTop() + shared.headerOffset() + 20)+'px');
        }

        $('#close_gdc_terms_data').bind('click', function(){
          $("#gdc_terms_data").dialog('close');
        });

        $('#gdc-data-invariant').bind('click', function(){
          $("#gdc-syn-data-list").find('div[name="syn_area"]').each(function(){
            let rp = $(this).html();
            let invariant = $(this).parent().children('div[name="syn_invariant"]');
            $(this).html(invariant[0].innerHTML);
            invariant[0].innerHTML = rp;
          });
        });
      },
      close: function() {
        $(this).remove();
      }
    }).parent().draggable({
      containment: '#docs-container'
    });

    if($('#show_all_gdc_syn') !== undefined){
        $('#show_all_gdc_syn').bind('click', function(){
            let v = $(this).prop("checked");
            if(v){
                $('#gdc-syn-data-list div.table__row[style="display: none;"]').each(function(){
                    $(this).css("display","block");
                });
            } else {
                $('#gdc-syn-data-list div.table__row[style="display: block;"]').each(function(){
                    $(this).css("display","none");
                });
            }
        });
    }

  });
}
