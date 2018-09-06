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
    if(trsHtml.len === 0 && psHtml.len === 0 && vsHtml.len === 0){
      trsHtml.active = false;
      psHtml.active = false;
      vsHtml.active = false;
      html = '<div class="indicator">Sorry, no results found for keyword: <span class="indicator__term">'+keyword+'</span></div>';
    }else{
      html = tabs(trsHtml, psHtml, vsHtml, keyword);
    }
  } else if (option.error == true) {
    html = '<div class="indicator indicator--has-error">Please, enter a valid keyboard!</div>';
  } else {
  	html = '<div class="indicator">Sorry, no results found for keyword: <span class="indicator__term">'+keyword+'</span></div>';
  }

  $("#root").html(html);

  $('#treeview .treeview__toggle').click(function (event) {
      event.preventDefault();
      let $this = $(this);
      let $target = $this.closest('.treeview__parent');
      $target.find('>ul.treeview__ul').toggle();
      if ($target.hasClass('treeview__parent--open')){
        $target.removeClass('treeview__parent--open');
        $this.attr('aria-label', 'expand');
        $this.html('<i class="fa fa-angle-down"></i>');
      }else{
        $target.addClass('treeview__parent--open');
        $this.attr('aria-label', 'collapse');
        $this.html('<i class="fa fa-angle-up"></i>');
      }
  });

  $('#trs-checkbox').click(function(){
    if(this.checked){
      $('.treeview__ul--all').addClass('treeview__ul').each(function(){
        let $this = $(this);
        let $prev = $this.prev('.treeview__ul--hl');
        if($prev.is(':visible')){
          $this.show();
          $prev.hide();
        }
      });
      $('.treeview__ul--hl').removeClass('treeview__ul');
    }else{
      $('.treeview__ul--hl').addClass('treeview__ul').each(function(){
        let $this = $(this);
        let $next = $this.next('.treeview__ul--all');
        if($next.is(':visible')){
          $this.show();
          $next.hide();
        }
      });;
      $('.treeview__ul--all').removeClass('treeview__ul');
    }
  });

  $('#trs_toggle').click(function(){
    let $this = $(this);
    let $tview_ul = $('.treeview .treeview__ul');
    let $tview_li = $('.treeview .treeview__parent');
    let $tview_trigger = $('.treeview .treeview__toggle');
    if($this.hasClass('active')){
      $tview_ul.hide();
      $tview_li.removeClass('treeview__parent--open');
      $tview_trigger.attr('aria-label', 'expand');
      $tview_trigger.html('<i class="fa fa-angle-down"></i>');
      $this.html('<i class="fa fa-angle-down"></i> Expand All');
    }else{
      $tview_ul.show();
      $tview_li.addClass('treeview__parent--open');
      $tview_trigger.attr('aria-label', 'collapse');
      $tview_trigger.html('<i class="fa fa-angle-up"></i>');
      $this.html('<i class="fa fa-angle-up"></i>  Collapse All');
    }
  });

  $('#tab-values').bind('click', function(){
    let option = JSON.parse(localStorage.getItem('option'));
    option.activeTab = 0;
    localStorage.setItem('option', JSON.stringify(option));
  });

  $('#tab-properties').bind('click', function(){
    let option = JSON.parse(localStorage.getItem('option'));
    option.activeTab = 1;
    localStorage.setItem('option', JSON.stringify(option));
  });

  $('#tab-dictionary').bind('click', function(){
    let option = JSON.parse(localStorage.getItem('option'));
    option.activeTab = 2;
    localStorage.setItem('option', JSON.stringify(option));
  });

  $('.show-more-less').click(function (event) {
    event.preventDefault();
    let $this = $(this);
    let $target = $(this).closest('.table__values').find('.table__row--toggle');
    if($this.hasClass('more')){
      $this.removeClass('more');
      $this.attr('aria-expanded', 'false');
      $target.slideToggle(350);
      $this.html('<i class="fa fa-angle-down"></i> Show More ('+ $this.attr('data-hidden') +')');
    } else {
      $this.addClass('more');
      $this.attr('aria-expanded', 'true');
      $target.slideToggle(350);
      $this.html('<i class="fa fa-angle-up"></i> Show Less');
    }
  });

  $('.table__toggle').click(function(event){
    event.preventDefault();
    let $this = $(this);
    let $target = $(this).closest('.table__gdc-values, .table__cde-values').find('.data-content');
    $target.slideToggle(400, function(){
      if($target.is(":visible")){
        $this.attr('title', 'collapse');
        $this.attr('aria-label', 'collapse');
        $this.attr('aria-expanded', 'true');
        $this.html('<i class="fa fa-minus"></i>');
      } else {
        $this.attr('title', 'expand');
        $this.attr('aria-label', 'expand');
        $this.attr('aria-expanded', 'false');
        $this.html('<i class="fa fa-plus"></i>');
      }
    });
  });

  $('.gdc-details').click(function(event){
    event.preventDefault();
    let $this = $(this);
    let $target = $(this).parent().find('.gdc-links');
    $target.slideToggle(350 ,function(){
      if($target.is(":visible")){
        $this.attr('aria-expanded', 'true');
      } else {
        $this.attr('aria-expanded', 'false');
      }
    });
  });

  $('.cde-suggest').click(function(event){
    event.preventDefault();
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
