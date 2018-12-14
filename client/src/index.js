import * as search from './search-bar/search-bar';
import render from './render';
import { onResize, onScroll, setHeight, dialogsOnResize } from './shared';
import { dtEvents } from './dict-table/dict-table';
import { vsEvents } from './values-table/values-table';
import { tabsEvents } from './tabs/tabs'
import { dialogEvents } from './dialog/dialog'

window.onload = () => {

  const init = () => {

    const $window = $(window);
    const $document = $(document);
    const $body = $(document.body);
    const $root = $('#root');

    const $search = $('#search');
    const $keywords = $('#keywords');
    const $searchClear = $('#searchclear');
    const $suggestBox = $('#suggestBox');

    const $docsContainer = $('#docs-container');
    const $parentContainer = $('.parent-container');
    const $gdcLoadingIcon = $('#gdc-loading-icon');

    const $searchOptionsBox = $('#search-bar-options');
    const $searchBooleanOptions = $('.search-bar__boolean');

    search.removeExternalLinkIcons();

    search.renderLocalStorach($keywords, $root, $searchOptionsBox, $gdcLoadingIcon);

    $searchOptionsBox.on('show.bs.dropdown', (event) => {
      $suggestBox.hide();
    });

    $search.click(() => {
      search.clickSearch($keywords, $root, $suggestBox, $gdcLoadingIcon)
    });

    $keywords.keypress((event) => {
      search.enterSearch(event, $keywords, $search);
    });

    $keywords.keydown((event) => {
      search.selectSuggestion(event, $suggestBox)
    });

    $keywords.bind('input', (event) => {
      search.suggest(event, $keywords, $searchClear, $suggestBox, $searchOptionsBox);
    });

    $document.click((event) => {
      search.removeBox(event, $suggestBox)
    });

    $searchClear.click((event) => {
      search.clearSearch(event, $keywords, $searchOptionsBox);
    });

    $searchBooleanOptions.click((event) => {
      search.booleanOptions(event, $keywords);
    });

    setHeight($docsContainer, $parentContainer);

    $window.scroll(() => {
      onScroll($window);
    });

    $window.resize(() => {
      onResize($docsContainer, $parentContainer);
      dialogsOnResize($window);
    });

    //Add the handles events
    dtEvents($root);
    tabsEvents($root);
    vsEvents($root);
    dialogEvents($root, $body);
  }

  init();
}
