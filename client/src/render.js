import trs from './result-table/';
import ps from './props-table/';
import vs from './values-table/';
import tabs from './tabs/'

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
        trsHtml.active = true;
    }
    else if(option.activeTab == 1){
        psHtml.active = true;
    }
    else{
        vsHtml.active = true;
    }
  	html = tabs(trsHtml, psHtml, vsHtml);
  }
  else{
  	html = '<div class="info">No result found for keyword: '+keyword+'</div>';
  }
  
  $("#root").html(html);
  
  if($("#tree_table").length){
      $("#tree_table").treetable({expandable: true});
      $("#collapse").bind("click", function(){
          $("#tree_table").find('a[title="Collapse"]').each(function(){
              $(this).trigger("click");
          });

      });

      $("#expand").bind("click", function(){
          $("#tree_table").find('a[title="Expand"]').each(function(){
              $(this).trigger("click");
          });
          $("#tree_table").find('a[title="Expand"]').each(function(){
              $(this).trigger("click");
          });
          $("#tree_table").find('a[title="Expand"]').each(function(){
              $(this).trigger("click");
          });

      });
  }

  let htmlShow = '';

  $('.show-more-less').click(function () {
    let target = $(this);

    let parentTable = $(this).parent().parent().parent();
    let targets = parentTable.find('.row-toggle');
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

  $('.cde-collapser').click(function(){
    let target = $(this);
    let parentTable = $(this).parent().parent().parent();

    let gdeContainer = parentTable.find('#cde-content');

    gdeContainer.slideToggle(400, function(){
      if(gdeContainer.is(":visible")){
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
    gdcLinks.slideToggle(400);
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

  // $('#table-body').scroll(function() {
  //   console.log('true');

  //   let vsTapTop = $('#vsTab').offset().top + 88;
  //   let vsTapBotton=  vsTapTop + $('#vsTab').height();

  //   $('.table-row').each(function(){
  //     var t = $(this);
  //     var thisTop = t.offset().top;
  //     var thisBotton = thisTop + t.height();
  //     var property =  t.find('.property');

  //     console.log('vsTapTop' + vsTapTop + 'vsTapBotton' + vsTapBotton +  'thisTop' + thisTop + 'thisBotton' + thisBotton)
  //     if(thisBotton > vsTapTop && thisBotton < vsTapBotton || thisTop < vsTapTop && thisTop > vsTapTop || thisTop < vsTapTop && thisBotton > vsTapBotton ){
  //       console.log(property);
  //       if(thisTop < vsTapTop || thisTop < vsTapTop && thisBotton > vsTapTop || thisTop < vsTapTop && thisBotton > vsTapBotton  )
  //         property.attr('style','opacity: 100; position: relative; top: '+ (vsTapTop - thisTop )+'px;');
  //       else{
  //         property.attr('style','opacity: 100; position: relative; top: 0');
  //       }
  //     }
  //     else{
  //       property.attr('style','opacity: 0;'); //property.hide();
  //     }
  //   });
  // });
  
}
