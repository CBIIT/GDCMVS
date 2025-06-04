let prevScrollOffset = 0;
let headerHeight = $('.navbar .container').height();
let headerOffset = headerHeight;
let notificationOn = false;

export const getHeaderOffset = () => headerOffset;

export const getScrollTop = () => prevScrollOffset;

export const onScroll = ($window) => {
  const currentScrollOffset = $window.scrollTop();
  const delta = currentScrollOffset - prevScrollOffset;

  if (delta > 0) {
    headerOffset = headerHeight - 64;
    prevScrollOffset = currentScrollOffset;
  } else {
    headerOffset = headerHeight;
    prevScrollOffset = currentScrollOffset;
  }
};

export const onResize = ($docsContainer, $parentContainer, $mainContainer) => {
  headerHeight = $('.navbar .container-fluid').height();
  // setHeight($docsContainer, $parentContainer, $mainContainer);
  headerOffset = headerHeight;
};

// export const setHeight = ($docsContainer, $parentContainer, $mainContainer) => {
//   $docsContainer.attr('style', 'margin-top: ' + (headerHeight - 54) + 'px !important');
//   $parentContainer.attr('style', 'min-height: calc(100vh - ' + (headerHeight + 10) + 'px)');
//   $mainContainer.attr('style', 'min-height: calc(100vh - ' + (headerHeight + 10) + 'px)');
// };

export const errorNotification = (status, errorThrown) => {
  if (notificationOn === true) return;
  notificationOn = true;
  // close progress bar
  $('#gdc-loading-icon').fadeOut('fast');
  // show the notification alert error
  const $alertError = $('#alert-error');
  $alertError.text('Error ' + status + ': ' + errorThrown);
  $alertError.css({ 'top': (getHeaderOffset() + 20) + 'px' }).addClass('alert__show');
  setTimeout(() => {
    $alertError.removeClass('alert__show');
    notificationOn = false;
  }, 3900);
};

export const dialogsOnResize = ($window) => {
  const dialogs = $('#gdc_data, #gdc_terms_data, #ncit_details, #compare_dialog, #source_details, #type_details');
  if (dialogs.length === 0) return;
  dialogs.each((index, element) => {
    const $target = $(element).parent();
    if ($target.offset().top < headerOffset) {
      $target.css('top', (headerOffset + 10) + 'px');
    } else if ($window.width() < ($target.offset().left + $target.width())) {
      $target.css('left', ($window.width() - $target.width() - 10) + 'px');
    }
  });
};

export const htmlChildContent = (tag, tmpl) => {
  const re = new RegExp('<' + tag + '>([^]*)<\/' + tag + '>', 'g');
  return re.exec(tmpl)[1];
};

export const getAllSyn = (items) => {
  items.forEach(em => {
    if (em.n_syn !== undefined) {
      em.all_syn = [];
      em.n_syn.forEach(syn => {
        em.all_syn = em.all_syn.concat(syn.s.map(function (x) { return x.termName; }));
      });
    }
  });
  return items;
};

export const searchFilter = (items, keyword) => {
  let allIcdo3Syn = getAllSyn(items);
  let newItem = [];
  JSON.parse(JSON.stringify(items)).forEach(item => {
    let idx = item.n.replace(/<b>/g, '').replace(/<\/b>/g, '').toLowerCase().indexOf(keyword);
    if (idx !== -1) {
      if (idx === 0) newItem.unshift(item);
      if (idx !== 0) newItem.push(item);
    }
  });
  // Search in synonyms
  JSON.parse(JSON.stringify(items)).forEach(item => {
    if (item.s !== undefined) {
      let tmpArr = item.s.map(function (s) { return s.termName.trim().toLowerCase(); }).map(function (s) { return s.indexOf(keyword) >= 0; });
      if (tmpArr.indexOf(true) >= 0 && !_.some(newItem, item)) {
        newItem.push(item);
      }
    }
  });

  // Search in all_syn synonyms if it has icdo3 code
  JSON.parse(JSON.stringify(items)).forEach(item => {
    if (item.all_syn !== undefined) {
      let tmpArr = item.all_syn.map(function (x) { return x.trim().toLowerCase(); }).map(function (s) { return s.indexOf(keyword) >= 0; });
      if (tmpArr.indexOf(true) >= 0 && !_.some(newItem, item)) {
        newItem.push(item);
      }
    } else if (item.i_c !== undefined && allIcdo3Syn[item.i_c.c] && allIcdo3Syn[item.i_c.c].all_syn) {
      let tmpArr = allIcdo3Syn[item.i_c.c].all_syn.map(function (x) { return x.trim().toLowerCase(); }).map(function (s) { return s.indexOf(keyword) >= 0; });
      if (tmpArr.indexOf(true) >= 0 && !_.some(newItem, item)) {
        newItem.push(item);
      }
    }
  });

  // Highlight matched values and synonyms
  newItem.forEach(item => {
    item.n = item.n.replace(/<b>/g, '').replace(/<\/b>/g, '').replace(new RegExp(keyword, 'ig'), '<b>$&</b>');
    if (item.s !== undefined) {
      item.s = item.s.map(function (s) { return { termName: s.termName.replace(/<b>/g, '').replace(/<\/b>/g, '').replace(new RegExp(keyword, 'ig'), '<b>$&</b>'), termGroup: s.termGroup, termSource: s.termSource }; });
    }
    if (item.i_c !== undefined && item.i_c.n_syn !== undefined) {
      item.i_c.n_syn.forEach(syn => {
        if (syn.s === undefined) return;
        syn.s = syn.s.map(function (x) { return { termName: x.termName.replace(/<b>/g, '').replace(/<\/b>/g, '').replace(new RegExp(keyword, 'ig'), '<b>$&</b>'), termGroup: x.termGroup, termSource: x.termSource }; });
      });
    }
    if (item.n_syn !== undefined) {
      item.n_syn.forEach(syn => {
        if (syn.s === undefined) return;
        syn.s = syn.s.map(function (x) { return { termName: x.termName.replace(/<b>/g, '').replace(/<\/b>/g, '').replace(new RegExp(keyword, 'ig'), '<b>$&</b>'), termGroup: x.termGroup, termSource: x.termSource }; });
      });
    }
  });
  return newItem;
};

export const searchFilterSyn = (syn, keyword) => {
  // Search in synonyms
  let newSyn = [];
  let tmpArr = syn.map(function (s) { return s.termName.trim().toLowerCase(); }).map(function (s) { return s.indexOf(keyword) >= 0; });
  tmpArr.forEach((tmpArr, index) => {
    if (tmpArr === true) {
      newSyn.push(syn[index]);
    }
  });
  return newSyn;
};

export const searchFilterCR = (items, keyword) => {
  let allIcdo3Syn = getAllSyn(items);
  let newItem = [];
  JSON.parse(JSON.stringify(items)).forEach(item => {
    let idx = item.n.replace(/<b>/g, '').replace(/<\/b>/g, '').toLowerCase().indexOf(keyword);
    if (idx !== -1) {
      if (idx === 0) newItem.unshift(item);
      if (idx !== 0) newItem.push(item);
    }
  });
  // Search in synonyms
  JSON.parse(JSON.stringify(items)).forEach(item => {
    if (item.s !== undefined) {
      let tmpArr = item.s.map(function (s) { return s.termName.trim().toLowerCase(); }).map(function (s) { return s.indexOf(keyword) >= 0; });
      if (tmpArr.indexOf(true) >= 0 && !_.some(newItem, item)) {
        newItem.push(item);
      }
    }
  });

  // Search in all_syn synonyms if it has icdo3 code
  JSON.parse(JSON.stringify(items)).forEach(item => {
    if (item.all_syn !== undefined) {
      let tmpArr = item.all_syn.map(function (x) { return x.trim().toLowerCase(); }).map(function (s) { return s.indexOf(keyword) >= 0; });
      if (tmpArr.indexOf(true) >= 0 && !_.some(newItem, item)) {
        newItem.push(item);
      }
    } else if (item.i_c !== undefined && allIcdo3Syn[item.i_c.c] && allIcdo3Syn[item.i_c.c].all_syn) {
      let tmpArr = allIcdo3Syn[item.i_c.c].all_syn.map(function (x) { return x.trim().toLowerCase(); }).map(function (s) { return s.indexOf(keyword) >= 0; });
      if (tmpArr.indexOf(true) >= 0 && !_.some(newItem, item)) {
        newItem.push(item);
      }
    }
  });

  return newItem;
};

export const sortAlphabetically = (values) => {
  values.sort((a, b) => {
    const an = a.n.replace(/<b>/g, '').replace(/<\/b>/g, '').toLowerCase();
    const bn = b.n.replace(/<b>/g, '').replace(/<\/b>/g, '').toLowerCase();
    if (an > bn) { return 1; }
    if (bn > an) { return -1; }
    return 0;
  });
  return values;
};

export const sortSynonyms = (synonyms) => {
  const mapped = { PT: 1, BR: 2, FB: 3, CN: 4, AB: 5, SY: 6, SN: 7, AD: 8, AQ: 9, AQS: 10 };
  synonyms.sort((a, b) => (mapped[a.termGroup] > mapped[b.termGroup]) ? 1 : (a.termGroup === b.termGroup) ? ((a.termName.toLowerCase() > b.termName.toLowerCase()) ? 1 : -1) : -1);
  return synonyms;
};

export const getHighlightObj = (highlight) => {
  let highlightObj = {};
  if (highlight !== undefined) {
    highlight.forEach(val => {
      let tmp = val.replace(/<b>/g, '').replace(/<\/b>/g, '');
      if (highlightObj[tmp] === undefined) highlightObj[tmp] = val;
    });
  }
  return highlightObj;
};
