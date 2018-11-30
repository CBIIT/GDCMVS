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
        let booleanKeyword = (/^(NOT|AND|OR)|(NOT|AND|OR)$/g).test(keywordCase);
        let booleanArray = keywordCase.match(/(NOT|AND|OR)/g);
        let option = {};

        //multi boolean error
        let keywordArray = keywordCase.split(' ');
        keywordArray.forEach(function(e,i){
          if(keywordArray[i-1] === e){
            booleanKeyword = true;
          }
        });

        //multi boolean options
        if (booleanArray !== null){
          booleanArray.forEach(function(e,i) {
            if (i === 0) return;
            if (booleanArray[0] !== e) {
              booleanKeyword = true;
            }
          });
        }

        if(keywordCase == "" || booleanKeyword){
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
            $('#keywords').val(PrevWord(this));
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
            let entered_value = PrevWord(this);

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

        let keyword = PrevWord(this);
        if(keyword.indexOf(' OR') !== -1 ) keyword = keyword.substring(keyword.lastIndexOf(' OR') + 4);
        if(keyword.indexOf(' AND') !== -1 ) keyword = keyword.substring(keyword.lastIndexOf(' AND') + 5);
        if(keyword.indexOf(' NOT') !== -1 ) keyword = keyword.substring(keyword.lastIndexOf(' NOT') + 5);

        let partialKeyword = PrevWord(this);
        if ((/.+(NOT|AND|OR)/g).test(partialKeyword)) {
          $('#suggestWidth').text(partialKeyword.match(/.+(NOT|AND|OR)/g)[0]);
        } else {
          $('#suggestWidth').text('');
        }

        api.suggest(keyword, function(result){
            if(result.length === 0){
                area.style.display = "none";
                displayBoxIndex = -1;
                area.innerHTML = "";
                return;
            }

            let suggestWidth = $('#suggestWidth').width();
            if(suggestWidth != 0){
              area.style.left = suggestWidth + 'px';
              area.style.width = 'auto';
            }else{
              area.removeAttribute('style');
            }

            area.style.display = "block";
            let html = $.templates(tmpl).render({options: result });;
            displayBoxIndex = -1;
            area.innerHTML = html;
            area.onclick = function(e){
                let $target = $(e.target)
                let t = $target.hasClass('suggest__object') ? $target.children('.suggest__name').text() : $target.parent().children('.suggest__name').text();
                let entered_value = PrevWord(document.getElementById('keywords'));
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

function ReturnWord(text, caretPos) {
    var index = text.indexOf(caretPos);
    var preText = text.substring(0, caretPos);
    return preText;
}

function PrevWord(text) {
    var caretPos = GetCaretPosition(text)
    var word = ReturnWord(text.value, caretPos);
    if (word != null) {
        return word;
    }
}

function GetCaretPosition(ctrl) {
    var CaretPos = 0;   // IE Support
    if (document.selection) {
        ctrl.focus();
        var Sel = document.selection.createRange();
        Sel.moveStart('character', -ctrl.value.length);
        CaretPos = Sel.text.length;
    }
    // Firefox support
    else if (ctrl.selectionStart || ctrl.selectionStart == '0')
        CaretPos = ctrl.selectionStart;
    return (CaretPos);
}

export default func;
