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

  $(".show-more-less").click(function () {
    let target = $(this);

    let parentTable = $(this).parent().parent().parent();
    let targets = parentTable.find('.row-toggle');
    if(target.text() == " Show Less"){
      targets.css({display: 'none'});
      target.html('<i class="fa fa-angle-down"></i> Show More');
    } else {
      targets.css({display: 'flex'});
      target.html('<i class="fa fa-angle-up"></i> Show Less');
    }
  });
  
}
