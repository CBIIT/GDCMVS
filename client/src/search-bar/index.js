import api from '../api';
import render from '../render';
import tmpl from './view';

let displayBoxIndex = -1;
let activeTab = 0;

const func = {
    search(){
        let keyword = $("#keywords").val();
        let option = {};

        if(keyword == ""){
            option.error = true;
            $('#keywords').addClass('search-bar__input--has-error');
            render(keyword, option, []);
            return;
        }

        keyword = keyword.toLowerCase();
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
        api.searchAll(keyword, option, function(keyword, option, items) {

          //Save the data in localStorage
          localStorage.setItem('keyword', keyword);
          localStorage.setItem('option', JSON.stringify(option));
          localStorage.setItem('items', JSON.stringify(items));

          render(keyword, option, items);
          //todo: close progress bar
          $('#gdc-loading-icon').fadeOut('fast');
        });
    },
    gotoSearch(e){
        if(e.keyCode == 13){
            e.preventDefault();
        }
        if(e.keyCode == 13 && $("#suggestBox .selected").length !== 0){
            let t = $("#suggestBox .selected").text();
            $("#keywords").val(t.substr(0,t.length-1));
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
            oBoxCollection.removeClass(cssClass).eq(displayBoxIndex).addClass(cssClass);
        }
    },
    suggest(){
        let area = document.getElementById("suggestBox");

        if($("#keywords").hasClass('search-bar__input--has-error')){
            $("#keywords").removeClass('search-bar__input--has-error');
        }

        if($(this).val().trim() === ''){
            area.style.display = "none";
            displayBoxIndex = -1;
            area.innerHTML = "";
            return;
        }

        api.suggest($(this).val(), function(result){
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
                $("#keywords").val(t);
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

export default func;
