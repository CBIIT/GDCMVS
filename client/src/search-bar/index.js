import api from '../api';
import render from '../render';
import tmpl from './view';
import shared from '../shared';

let displayBoxIndex = -1;
let activeTab = 0;

const func = {
    search(){
        let keywordCase = $("#keywords").val().trim();
        let keyword = keywordCase.toLowerCase();
        let option = {};

        if(keywordCase == ""){
            option.error = true;
            $('#keywords').addClass('search-bar__input--has-error');
            render(keywordCase, option, []);
            return;
        }

        //get selected tab
        let count = 0;
        $("li[role='presentation']").each(function(){
            if($(this).hasClass("active")){
                activeTab = count;
            }
            count++;
        });

        option.desc = $("#i_desc").prop('checked');
        option.syn = $("#i_syn").prop('checked');
        option.match = $("#i_ematch").prop('checked') ? "exact" : "partial";
        option.activeTab = option.desc ? 1 : activeTab;
        $("#suggestBox").css("display","none");
        displayBoxIndex = -1;
        //todo:show progress bar
        $('#gdc-loading-icon').fadeIn(100);
        api.searchAll(keywordCase, option, function(keyword, option, items) {

          //Save the data in localStorage
          localStorage.setItem('keyword', keywordCase);
          localStorage.setItem('option', JSON.stringify(option));
          localStorage.setItem('items', JSON.stringify(items));

          render(keywordCase, option, items);
          //todo: close progress bar
          $('#gdc-loading-icon').fadeOut('fast');
        }, function(status, errorThrown) {
          $('#gdc-loading-icon').fadeOut('fast');
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
    gotoSearch(e){
        if(e.keyCode == 13){
            e.preventDefault();
        }
        if(e.keyCode == 13 && $("#suggestBox .selected").length !== 0){
            let t = $("#suggestBox .selected").children('.suggest__name').text();
            let entered_value = $('#keywords').val();
            $('#keywords').val(getFinalSuggestion(t, entered_value));
            $("#search").trigger("click");
        }
        else if (e.keyCode == 13) {
            $("#search").trigger("click");
        }
    },
    selectSuggestion(e){
        if ((e.keyCode == 40 || e.keyCode == 38) && $(this).val().trim() !== "" && document.getElementById("suggestBox").style.display !== "none") {
            e.preventDefault();
            //focus to the first element

            displayBoxIndex += (e.keyCode == 40 ? 1 : -1);
            let oBoxCollection = $("#suggestBox").find("div");
            if (displayBoxIndex >= oBoxCollection.length)
                 displayBoxIndex = 0;
            if (displayBoxIndex < 0)
                 displayBoxIndex = oBoxCollection.length - 1;
            let cssClass = "selected";
            let suggest_value = oBoxCollection.eq(displayBoxIndex).children('.suggest__name').text();
            let entered_value = $('#keywords').val();
            
            $('#keywords').val(getFinalSuggestion(suggest_value, entered_value));
            
            oBoxCollection.removeClass(cssClass).eq(displayBoxIndex).addClass(cssClass);
        }
    },
    suggest(){
        let area = document.getElementById("suggestBox");
        let searchoptions = $('#search-bar-options');

        if($("#keywords").hasClass('search-bar__input--has-error')){
            $("#keywords").removeClass('search-bar__input--has-error');
        }

        searchoptions.show();

        if($(this).val().trim() === ''){
            area.style.display = "none";
            displayBoxIndex = -1;
            area.innerHTML = "";
            searchoptions.hide();
            return;
        }
        
        let keyword = $(this).val();
        if(keyword.indexOf(' OR') !== -1 ) keyword = keyword.substring(keyword.lastIndexOf(' OR') + 4);
        if(keyword.indexOf(' AND') !== -1 ) keyword = keyword.substring(keyword.lastIndexOf(' AND') + 5);
        if(keyword.indexOf(' NOT') !== -1 ) keyword = keyword.substring(keyword.lastIndexOf(' NOT') + 5);
        
        api.suggest(keyword, function(result){
            if(result.length === 0){
                area.style.display = "none";
                displayBoxIndex = -1;
                area.innerHTML = "";
                return;
            }

            area.style.display = "block";
            let html = $.templates(tmpl).render({options: result });;
            displayBoxIndex = -1;
            area.innerHTML = html;
            area.onclick = function(e){
                let t = $(e.target).text();
                let entered_value = $('#keywords').val();
                $("#keywords").val(getFinalSuggestion(t, entered_value));
                $("#keywords").focus();
            };
        });
    },
    removeBox(e){
        if($(e.target) != $("#suggestBox")){
            $("#suggestBox").css("display","none");
            displayBoxIndex = -1;
        }
    }
}

function getFinalSuggestion(suggest_value, entered_value){
    let final_keyword = suggest_value;        
    if(entered_value.indexOf(' OR') !== -1) final_keyword = entered_value.substring(0, entered_value.lastIndexOf('OR')) + 'OR ' + suggest_value;
    if(entered_value.indexOf(' AND') !== -1) final_keyword = entered_value.substring(0, entered_value.lastIndexOf('AND')) + 'AND ' + suggest_value;
    if(entered_value.indexOf(' NOT') !== -1) final_keyword = entered_value.substring(0, entered_value.lastIndexOf('NOT')) + 'NOT ' + suggest_value;
    return final_keyword;
}

export default func;
