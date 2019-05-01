import { apiSuggest, apiSearchAll, apiGDCDictionaryVersion } from '../api';
import render from '../render';
import { getHeaderOffset } from '../shared';
import { removePopUps } from '../dialog/dialog';
import template from './search-bar-view';

let displayBoxIndex = -1;

const getActiveTap = () => {
  let value = 0
  let count = 0;
  $('.tab-nav__li').each((index, element) => {
    if ($(element).hasClass('active')) {
      value = count;
    }
    count++;
  });
  return value;
}

const getOption = (activeTab) => {
  let option = {}
  //get options values
  option.desc = $('#i_desc').prop('checked');
  option.syn = $('#i_syn').prop('checked');
  option.match = $('#i_ematch').prop('checked') ? 'exact' : 'partial';
  option.activeTab = option.desc ? 1 : activeTab;
  return option;
}

const getFinalSuggestion = (suggest_value, entered_value) => {
  let final_keyword = suggest_value;
  if (entered_value.indexOf(' OR') !== -1) final_keyword = entered_value.substring(0, entered_value.lastIndexOf('OR')) + 'OR ' + suggest_value;
  if (entered_value.indexOf(' AND') !== -1) final_keyword = entered_value.substring(0, entered_value.lastIndexOf('AND')) + 'AND ' + suggest_value;
  if (entered_value.indexOf(' NOT') !== -1) final_keyword = entered_value.substring(0, entered_value.lastIndexOf('NOT')) + 'NOT ' + suggest_value;
  return final_keyword;
}

const ReturnWord = (text, caretPos) => {
  var index = text.indexOf(caretPos);
  var preText = text.substring(0, caretPos);
  return preText;
}

const PrevWord = (text) => {
  var caretPos = GetCaretPosition(text)
  var word = ReturnWord(text.value, caretPos);
  if (word != null) {
    return word;
  }
}

const GetCaretPosition = (ctrl) => {
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

export const clickSearch = ($keywords, $root, $suggestBox, $gdcLoadingIcon) => {
  let keywordCase = $keywords.val().trim();
  let keyword = keywordCase.toLowerCase();
  let activeTab = getActiveTap();
  let option = getOption(activeTab);

  if (keywordCase == '') {
    option.error = true;
    $keywords.addClass('search-bar__input--has-error');
    render($root, keywordCase, option, []);
    return;
  }
  //hide suggestBox
  $suggestBox.hide();
  displayBoxIndex = -1;

  //show progress bar
  $gdcLoadingIcon.fadeIn(100);

  apiSearchAll(keywordCase, option, (keyword, option, items) => {
    // Clear the data in localStorage
    localStorage.clear();
    // Save the data in localStorage
    localStorage.setItem('keyword', keywordCase);
    localStorage.setItem('option', JSON.stringify(option));

    render($root, keywordCase, option, items);
    //close progress bar
    $gdcLoadingIcon.fadeOut('fast');

    //remove pop-ups
    removePopUps();
  });
}


export const enterSearch = (event, $keywords, $search) => {
  const $selectedSuggest = $('#suggestBox .selected');
  const selectedTerm = $selectedSuggest.children('.suggest__name').text();;
  if (event.keyCode == 13) {
    event.preventDefault();
  }
  if (event.keyCode == 13 && $selectedSuggest.length !== 0) {
    $keywords.val(PrevWord(event.currentTarget));
    $search.trigger('click');
  }
  else if (event.keyCode == 13) {
    $search.trigger('click');
  }
}

export const selectSuggestion = (event, $suggestBox) => {
  let $this = $(event.currentTarget);

  if ((event.keyCode == 40 || event.keyCode == 38) &&
    $this.val().trim() !== '' &&
    $suggestBox.css('display') != 'none') {

    event.preventDefault();
    //focus to the first element
    displayBoxIndex += (event.keyCode == 40 ? 1 : -1);
    let $boxCollection = $suggestBox.find('div');
    if (displayBoxIndex >= $boxCollection.length) {
      displayBoxIndex = 0;
    }
    if (displayBoxIndex < 0) {
      displayBoxIndex = $boxCollection.length - 1;
    }
    $boxCollection.removeClass('selected').eq(displayBoxIndex).addClass('selected');

    let suggest_value = $boxCollection.eq(displayBoxIndex).children('.suggest__name').text();
    let entered_value = PrevWord(event.currentTarget);

    $('#keywords').val(getFinalSuggestion(suggest_value, entered_value));
  }
}

export const suggest = (event, $keywords, $searchClear, $suggestBox, $searchOptionsBox) => {
  let $this = $(event.currentTarget);

  if ($keywords.hasClass('search-bar__input--has-error')) {
    $keywords.removeClass('search-bar__input--has-error');
  }

  $searchOptionsBox.show();

  if ($this.val().trim() === '') {
    $suggestBox.hide().html('');
    displayBoxIndex = -1;
    $searchOptionsBox.hide();
    return;
  }

  let keyword = PrevWord(event.currentTarget);
  if (keyword.indexOf(' OR') !== -1 && keyword.indexOf(' AND') === -1 && keyword.indexOf(' NOT') === -1) keyword = keyword.substring(keyword.lastIndexOf(' OR') + 4);
  if (keyword.indexOf(' AND') !== -1 && keyword.indexOf(' OR') === -1 && keyword.indexOf(' NOT') === -1) keyword = keyword.substring(keyword.lastIndexOf(' AND') + 5);
  if (keyword.indexOf(' NOT') !== -1 && keyword.indexOf(' AND') === -1 && keyword.indexOf(' OR') === -1) keyword = keyword.substring(keyword.lastIndexOf(' NOT') + 5);

  let partialKeyword = PrevWord(event.currentTarget);
  if ((/.+(NOT|AND|OR)/g).test(partialKeyword)) {
    $('#suggestWidth').text(partialKeyword.match(/.+(NOT|AND|OR)/g)[0]);
  } else {
    $('#suggestWidth').text('');
  }

  apiSuggest(keyword, (results) => {
    if (results.length === 0) {
      $suggestBox.hide().html('');
      displayBoxIndex = -1;
      return;
    }

    let suggestWidth = $('#suggestWidth').width();
    if (suggestWidth != 0) {
      $suggestBox.css({ left: suggestWidth + 'px', width: 'auto' });
    } else {
      $suggestBox.css({ left: '', width: '' });
    }

    let html = template(results);
    displayBoxIndex = -1;

    $suggestBox.show().html(html);

    $suggestBox.click((event) => {
      let $target = $(event.target)
      let t = $target.hasClass('suggest__object') ? $target.children('.suggest__name').text() : $target.parent().children('.suggest__name').text();
      let entered_value = PrevWord(document.getElementById('keywords'));
      $keywords.val(getFinalSuggestion(t, entered_value)).focus();
    });
  });
}

export const removeBox = (event, $suggestBox) => {
  if ($(event.currentTarget) != $suggestBox) {
    $suggestBox.hide();
    displayBoxIndex = -1;
  }
}

export const clearSearch = (event, $keywords, $searchOptionsBox) => {
  event.preventDefault();
  $searchOptionsBox.hide();
  $keywords.val('').focus();
}

export const booleanOptions = (event, $keywords) => {
  event.preventDefault();
  let boolean_value = $(event.currentTarget).data('boolean');
  $keywords.val((index, value) => `${value} ${boolean_value} `).focus();
}

export const removeExternalLinkIcons = () => {
  $('#body a[href^="http"]').each((index, element) => {
    let $this = $(element);
    $this.removeClass('external-link');
    $this.html($.trim($this[0].innerText));
  });
}

export const renderLocalStorage = ($keywords, $root, $searchOptionsBox, $gdcLoadingIcon) => {

  //remove previus local items
  if(!localStorage.hasOwnProperty('items')){
    localStorage.removeItem('items');
  }

  if (localStorage.hasOwnProperty('keyword') &&
    localStorage.hasOwnProperty('option')) {

    $gdcLoadingIcon.show();

    let keyword = localStorage.getItem('keyword');
    let option = JSON.parse(localStorage.getItem('option'));

    $keywords.val(keyword);

    if (option.match != 'partial') {
      $('#i_ematch').prop('checked', true);
    }
    if (option.desc != false) {
      $('#i_desc').prop('checked', true);
    }
    if (option.syn != false) {
      $('#i_syn').prop('checked', true);
    }

    $searchOptionsBox.show();

    apiSearchAll(keyword, option, (keyword, option, items) => {
      render($root, keyword, option, items);
      //close progress bar
      $gdcLoadingIcon.fadeOut('fast');
    });
  }
}

export const gdcDictionaryVersion = ($gdcVersionContent, callback) => {
  apiGDCDictionaryVersion((result) => {
    $gdcVersionContent.html(`GDC Dictionary Version - ${result}`)
  });
};
