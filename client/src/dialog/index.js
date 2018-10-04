import tmpl from './view';
import api from '../api';
import shared from '../shared';
import gdcData from './gdc-data';
import gdcTerms from './gdc-terms';
import cdeData from './cde-data';
import ncitDetails from './ncit-details';

const func = {
  getGDCData(prop, tgt, keyword) {
    gdcData(prop, tgt, keyword);
  },
  getGDCTerms(uid, tgts) {
    gdcTerms(uid, tgts);
  },
  toCompare(uid){
  	api.getGDCDataById(uid, function(id, items) {
 		if($('#compare_dialog').length){
            $('#compare_dialog').remove();
        }
        let windowEl = $(window);
        let icdo = false;
        let icdo_items = [];
        let item_checker = {};
        items.forEach(function(item){
          if (item.i_c !== undefined) {
            icdo = true;
          }
          if(item.gdc_d === false){
            return;
          }
          if(item_checker[item.n] === undefined) icdo_items.push(item);
          item_checker[item.n] = item;
        });

        if(icdo){
          items = icdo_items;
        }

        let html = $.templates(tmpl.toCompare).render({items: items});

        let tp = (window.innerHeight * 0.2 < shared.headerOffset() )? 20 : window.innerHeight * 0.2;
        //display result in a table
        $(document.body).append(html);
        $("#compare_dialog").dialog({
            modal: false,
            position: { my: "center top+"+tp, at: "center top", of:$('#docs-container')},
            width: 750,
            height: 630,
            minWidth: 750,
            maxWidth: 900,
            minHeight: 542,
            maxHeight: 800,
            title: "Compare Your Values with GDC Values ",
            open: function() {

                var target = $(this).parent();
                target.find('.ui-dialog-titlebar').css('padding','15px');
                target.find('.ui-dialog-titlebar-close').html('');
                if((target.offset().top - windowEl.scrollTop()) < shared.headerOffset()){
                    target.css('top', (windowEl.scrollTop() + shared.headerOffset() + 20)+'px');
                }

                $('#cp_result').css("display", "none");
                $('#compare').bind('click', function(){
                    let gv = [];
                    items.forEach(function(item){
                    	gv.push(item.n);
                    });
                    compare(gv);
                });
                $('#cancelCompare').bind('click', function(){
                    $("#compare_dialog").dialog('close');
                });
            },
            close: function() {
                $(this).remove();
            }
        }).parent().draggable({
            containment: '#docs-container'
        });

    }, function(status, errorThrown) {
        //show the notification alert error
        let alertError = $('#alert-error');
        alertError.text('Error ' + status + ': ' + errorThrown);
        alertError.removeClass('animated fadeInDownUp').css({'display': 'none'});
        let animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
        alertError.css({'display': 'block', 'top': (shared.headerOffset() + 20 ) + 'px'}).addClass('animated fadeInDownUp').one(animationEnd, function() {
          alertError.css({'display': 'none'})
        });
    });
  },

  getCDEData(uid, tgts) {
    cdeData(uid, tgts);
  },
  compareGDC(prop, uid){
    let ids = {};
    ids.local = prop;
    ids.cde = uid;
    api.getGDCandCDEDataById(ids, function(ids, items) {
        if($('#compareGDC_dialog').length){
            $('#compareGDC_dialog').remove();
        }
        let windowEl = $(window);
        let popup = '<div id="compareGDC_dialog">'
                        +'<div id="compareGDC_result"></div>'
                    +'</div>';
        $(document.body).append(popup);
        let tp = (window.innerHeight * 0.2 < shared.headerOffset() )? shared.headerOffset() + 20 : window.innerHeight * 0.2;
        let toV = [];
        let fromV = [];
        let opt = {};
        opt.sensitive = false;
        opt.unmatched = false;
        items.to.forEach(function(t){
            toV.push(t.n);
        });
        items.from.forEach(function(f){
            fromV.push(f.n);
        });
        let table = generateCompareGDCResult(fromV, toV, opt);
        let html = '<div id="cpGDC_result_option">'
                    +'<div id="cpGDC_result_table" class="table__container">'+table+'</div>'
                    +'</div>';

        let titleComponent = '<div class="checkbox ui-checkbox"><label class="checkbox__label checkbox__label--height"><input id="compareGDC_filter" class="checkbox__input" type="checkbox" value=""><span class="checkbox__btn"><i class="checkbox__icon fa fa-check"></i></span> Case Sensitive</label>'
         + '<label class="checkbox__label checkbox__label--height"><input id="compareGDC_unmatched" class="checkbox__input" type="checkbox" value=""><span class="checkbox__btn"><i class="checkbox__icon fa fa-check"></i></span> Hide Unmatched Values</label></div>';

        $('#compareGDC_result').html(html);

        $("#compareGDC_dialog").dialog({
                modal: false,
                position: { my: "center top+"+tp, at: "center top", of:$('#docs-container')},
                width: 750,
                height: 550,
                minWidth: 715,
                maxWidth: 900,
                minHeight: 300,
                maxHeight: 800,
                title: "Compare GDC Values with caDSR Values ",
                open: function() {

                    var target = $(this).parent();
                    target.find('.ui-dialog-titlebar').css('padding','15px').append(titleComponent);
                    target.find('.ui-dialog-titlebar-close').html('');
                    if((target.offset().top - windowEl.scrollTop()) < shared.headerOffset()){
                        target.css('top', (windowEl.scrollTop() + shared.headerOffset() + 20)+'px');
                    }

                    $('#compareGDC_filter').bind('click', function(){
                        let options = {};
                        options.sensitive = $("#compareGDC_filter").prop('checked');
                        options.unmatched = $("#compareGDC_unmatched").prop('checked');
                        let table_new = generateCompareGDCResult(fromV, toV, options);
                        $('#cpGDC_result_table').html(table_new);
                    });
                    $('#compareGDC_unmatched').bind('click', function(){
                        let options = {};
                        options.sensitive = $("#compareGDC_filter").prop('checked');
                        options.unmatched = $("#compareGDC_unmatched").prop('checked');
                        let table_new = generateCompareGDCResult(fromV, toV, options);
                        $('#cpGDC_result_table').html(table_new);
                    });
                },
                close: function() {
                    $(this).remove();
                }
        }).parent().draggable({
            containment: '#docs-container'
        });
    }, function(status, errorThrown) {
      //show the notification alert error
      let alertError = $('#alert-error');
      alertError.text('Error ' + status + ': ' + errorThrown);
      alertError.removeClass('animated fadeInDownUp').css({'display': 'none'});
      let animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
      alertError.css({'display': 'block', 'top': (shared.headerOffset() + 20 ) + 'px'}).addClass('animated fadeInDownUp').one(animationEnd, function() {
        alertError.css({'display': 'none'})
      });
    });
  },
  getNCITDetails(uid) {
    ncitDetails(uid);
  }
};

export default func;
