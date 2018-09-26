import api from '../api';
import render from '../render';
import tmpl from './view';
import { getHeaderOffset } from '../shared';

let displayBoxIndex = -1;

const getActiveTap = () => {
  let value = 0
  let count = 0;
  $('.tab-nav__li').each((index, element) => {
    if ($(element).hasClass("active")) {
      value = count;
    }
    count++;
  });
  return value;
}

const getOption = (activeTab) => {
  let option = {}
  //get options values
  option.desc = $("#i_desc").prop('checked');
  option.syn = $("#i_syn").prop('checked');
  option.match = $("#i_ematch").prop('checked') ? "exact" : "partial";
  option.activeTab = option.desc ? 1 : activeTab;

  return option;
}

export const clickSearch = ($keywords) => {
  let keywordCase = $keywords.val();
  let keyword = keywordCase.toLowerCase();
  let activeTab = getActiveTap();
  let option = getOption(activeTab);

  if (keywordCase == "") {
    option.error = true;
    $keywords.addClass('search-bar__input--has-error');
    render(keywordCase, option, []);
    return;
  }
  //hide suggestBox
  $("#suggestBox").css("display", "none");
  displayBoxIndex = -1;

  //todo:show progress bar
  $('#gdc-loading-icon').fadeIn(100);

  api.searchAll(keyword, option, function (keyword, option, items) {

    //Save the data in localStorage
    localStorage.setItem('keyword', keywordCase);
    localStorage.setItem('option', JSON.stringify(option));
    localStorage.setItem('items', JSON.stringify(items));

    render(keywordCase, option, items);
    //todo: close progress bar
    $('#gdc-loading-icon').fadeOut('fast');
  }, function (status, errorThrown) {
    //todo: close progress bar
    $('#gdc-loading-icon').fadeOut('fast');
    //show the notification alert error
    let alertError = $('#alert-error');
    alertError.text('Error ' + status + ': ' + errorThrown);
    alertError.removeClass('animated fadeInDownUp').css({ 'display': 'none' });
    let animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
    alertError.css({ 'display': 'block', 'top': (getHeaderOffset() + 20) + 'px' }).addClass('animated fadeInDownUp').one(animationEnd, function () {
      alertError.css({ 'display': 'none' })
    });
  });
}

export const enterSearch = (event, $keywords, $search) => {
  const $selectedSuggest = $("#suggestBox .selected");

  if (event.keyCode == 13) {
    event.preventDefault();
  }
  if (event.keyCode == 13 && $selectedSuggest.length !== 0) {
    let term = $selectedSuggest.text();
    $keywords.val(term.substr(0, term.length - 1));
    $search.trigger("click");
  }
  else if (event.keyCode == 13) {
    $search.trigger("click");
  }
}

export const selectSuggestion = (event, $suggestBox) => {
  let $this = $(event.currentTarget);

  if ((event.keyCode == 40 || event.keyCode == 38) &&
    $this.val().trim() !== "" &&
    $suggestBox.css('display') != 'none') {

    event.preventDefault();
    //focus to the first element
    displayBoxIndex += (event.keyCode == 40 ? 1 : -1);
    let $boxCollection = $suggestBox.find("div");
    if (displayBoxIndex >= $boxCollection.length) {
      displayBoxIndex = 0;
    }
    if (displayBoxIndex < 0) {
      displayBoxIndex = $boxCollection.length - 1;
    }
    $boxCollection.removeClass('selected').eq(displayBoxIndex).addClass('selected');
  }
}

export const suggest = (event, $keywords, $searchClear, $suggestBox) => {
  let $this = $(event.currentTarget);

  if ($keywords.hasClass('search-bar__input--has-error')) {
    $keywords.removeClass('search-bar__input--has-error');
  }

  $searchClear.show();

  if ($this.val().trim() === '') {
    $suggestBox.hide().html('');
    displayBoxIndex = -1;
    $searchClear.hide();
    return;
  }

  api.suggest($(event.currentTarget).val(), function (result) {
    if (result.length === 0) {
      $suggestBox.hide().html('');
      displayBoxIndex = -1;
      return;
    }

    let html = $.templates(tmpl).render({ options: result });;
    displayBoxIndex = -1;

    $suggestBox.show().html(html);

    $suggestBox.click((event) => {
      let target = $(event.target).text();
      $keywords.val(target).focus();
    });
  });
}

export const removeBox = (event) => {
  if ($(event.currentTarget) != $("#suggestBox")) {
    $("#suggestBox").css("display", "none");
    displayBoxIndex = -1;
  }
}

export const clearSearch = (event, $keywords) => {
  event.preventDefault();
  $(event.currentTarget).hide();
  $keywords.val('').focus();
}
