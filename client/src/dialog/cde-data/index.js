import tmpl from './view';
import api from '../../api';
import { getHeaderOffset } from '../../shared';

export default function cdeData(uid, tgts){
  api.getCDEDataById(uid, function(id, items) {
    //data precessing
    let tmp = [];
    items.forEach(function(item){
      let t = {};
      t.pv = item.n;
      t.pvm = item.m;
      t.pvd = item.d;
      t.i_rows = [];
      t.rows = [];
      item.ss.forEach(function(s){
        let i_r = {};
        let r = {};
        i_r.pvc = s.c;
        r.pvc = s.c;
        r.s = s.s;
        i_r.s = [];
        //remove duplicate
        let cache = {};
        s.s.forEach(function(w){
          let lc = w.trim().toLowerCase();
          if(!(lc in cache)){
            cache[lc] = [];
          }
          cache[lc].push(w);
        });
        for(let idx in cache){
          //find the term with the first character capitalized
          let word = findWord(cache[idx]);
          i_r.s.push(word);
        }
        t.i_rows.push(i_r);
        t.rows.push(r);
      });
      tmp.push(t);
    });

    let targets = null;
    let windowEl = $(window);

    if(tgts !== null && tgts !== undefined && tgts !== ""){
      tgts = tgts.replace(/\^/g,'\'');
      targets = tgts.split("#");

      tmp.forEach(function(item){
        if (targets.indexOf(item.pv) > -1){
          item.e = true;
        }
      });
    }

    if($('#caDSR_data').length){
      $('#caDSR_data').remove();
    }
    let header = $.templates(tmpl.header).render({targets: targets, items_length: items.length });

    let html = $.templates({markup: tmpl.body, allowCode: true}).render({targets: targets, items: tmp });
    let tp = (window.innerHeight * 0.2 < getHeaderOffset() )? getHeaderOffset() + 20 : window.innerHeight * 0.2;

    //display result in a table
    $(document.body).append(html);

    $("#caDSR_data").dialog({
      modal: false,
      position: { my: "center top+"+tp, at: "center top", of:$('#docs-container')},
      width: 900,
      height: 'auto',
      minWidth: 700,
      maxWidth: 1000,
      minHeight: 300,
      maxHeight: 600,
      title: "caDSR Values",
      open: function() {
        //add new custom header
        $(this).prev('.ui-dialog-titlebar').css('padding-top', '7.5em').html(header);

        var target = $(this).parent();
        if((target.offset().top - windowEl.scrollTop()) < getHeaderOffset()){
          target.css('top', (windowEl.scrollTop() + getHeaderOffset() + 20)+'px');
        }

        $('#close_caDSR_data').bind('click', function(){
          $("#caDSR_data").dialog('close');
        });

        $('#cde-data-invariant').bind('click', function(){
          $("#cde-syn-data-list").find('div[name="syn_area"]').each(function(){
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

    if($('#show_all_cde_syn') !== undefined){
      $('#show_all_cde_syn').bind('click', function(){
        let v = $(this).prop("checked");
        if(v){
          $('#cde-syn-data-list div.table__row[style="display: none;"]').each(function(){
            $(this).css("display","block");
          });
        }
        else{
          $('#cde-syn-data-list div.table__row[style="display: block;"]').each(function(){
            $(this).css("display","none");
          });
        }
      });
    }

  }, function(status, errorThrown) {
    //show the notification alert error
    let alertError = $('#alert-error');
    alertError.text('Error ' + status + ': ' + errorThrown);
    alertError.removeClass('animated fadeInDownUp').css({'display': 'none'});
    let animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
    alertError.css({'display': 'block', 'top': (getHeaderOffset() + 20 ) + 'px'}).addClass('animated fadeInDownUp').one(animationEnd, function() {
      alertError.css({'display': 'none'})
    });
  });
}
