import trs from './result-table/';
import ps from './props-table/';
import vs from './values-table/';
import tabs from './tabs/'
import shared from './shared'

export default function render(keyword, option, items){
  let html = "";
  if(items.length !== 0){
  	let trsHtml = trs.render(items);
    trsHtml.active = false;
  	let psHtml = ps.render(items);
    psHtml.active = false;
  	let vsHtml = vs.render(items);
    vsHtml.active = false;
    if(option.activeTab == 0){
      vsHtml.active = true;
    }
    else if(option.activeTab == 1){
      psHtml.active = true;
    }
    else{
      trsHtml.active = true;
    }
  	html = tabs(trsHtml, psHtml, vsHtml, keyword);
  } else if (option.error == true) {
    html = '<div class="indicator indicator--has-error">Please, enter a valid keyboard!</div>';
  } else {
  	html = '<div class="indicator">Sorry, no results found for kerword: <span class="indicator__term">'+keyword+'</span></div>';
  }

  $("#root").html(html);

  if($("#tree_table").length){
    $("#tree_table").treetable({expandable: true});
    $("#tree_toggle").bind('click', function(){
      var target = $(this);
      if(target.attr("aria-pressed") == 'true') {
        target.html('<i class="fa fa-angle-down"></i> Expand All');
        $('#gdc-loading-icon').fadeIn(100);

        setTimeout(function(){
          $("#tree_table").find('a[title="Collapse"]').each(function(){
            $(this).trigger("click");
          });
          $('#gdc-loading-icon').fadeOut('fast');
        }, 1000);
      } else {
        target.html('<i class="fa fa-angle-up"></i>  Collapse All');
        $('#gdc-loading-icon').fadeIn(100);

        setTimeout(function(){
          $("#tree_table").find('a[title="Expand"]').each(function(){
            $(this).trigger("click");
          });
          $("#tree_table").find('a[title="Expand"]').each(function(){
            $(this).trigger("click");
          });
          $("#tree_table").find('a[title="Expand"]').each(function(){
            $(this).trigger("click");
          });
          $('#gdc-loading-icon').fadeOut('fast');
        }, 1000);
      }
    });
  }

  let htmlShow = '';

  $('.show-more-less').click(function () {
    let target = $(this);

    let parentTable = $(this).parent().parent().parent();
    let targets = parentTable.find('.table__row--toggle');
    if(target.hasClass('more')){
      target.removeClass('more');
      targets.css({display: 'none'});
      target.html(htmlShow == ''? '<i class="fa fa-angle-down"></i> Show More' : htmlShow);
    } else {
      htmlShow = target.html();
      target.addClass('more');
      targets.css({display: 'flex'});
      target.html('<i class="fa fa-angle-up"></i> Show Less');
    }
  });

  $('.collapser').click(function(){
    let target = $(this);
    let parentTable = $(this).parent().parent().parent();

    let dataContainer = parentTable.find('#data-content');

    dataContainer.slideToggle(400, function(){
      if(dataContainer.is(":visible")){
        target.html('<i class="fa fa-minus"></i>');
      }else{
        target.html('<i class="fa fa-plus"></i>');
      }
    });
  });


  $('.gdc-details').click(function(){
    let target = $(this);
    let parentTarget = $(this).parent();
    let gdcLinks = parentTarget.find('#gdc-links');
    gdcLinks.slideToggle(350);
  });

  let hiddenRows = $('#tree_table').find('.data-hide');
  $('#trs-checkbox').click(function(){
    if(this.checked){
      hiddenRows.each(function(){
        $(this).removeClass('hide');
      });
    }else{
      hiddenRows.each(function(){
        $(this).addClass('hide');
      });
    }
  });

  $('.cd e-suggest').click(function(){
    var alertSuggest = $('#alert-suggest');
    alertSuggest.removeClass('animated fadeInDownUp').css({'display': 'none'});
    var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
    alertSuggest.css({'display': 'block', 'top': (shared.headerOffset() + 20 ) + 'px'}).addClass('animated fadeInDownUp').one(animationEnd, function() {
      alertSuggest.css({'display': 'none'})
    });
  });

  var windowEl = $(window);

  windowEl.resize(function() {
    var heightSlider = $('.navbar .container').height();
    var dialogs = $('#gdc_data, #gdc_syn_data, #compare_dialog, #caDSR_data, #compareGDC_dialog');
    dialogs.each(function(){
      var target = $(this).parent();
      if(target.offset().top < heightSlider){
        target.css('top', (heightSlider+10)+"px");
      }else if(windowEl.width() < (target.offset().left + target.width())){
        target.css('left', (windowEl.width() - target.width() - 10)+"px");
      }
    });
  });

  $('.tooltip-target').tooltip();

}
