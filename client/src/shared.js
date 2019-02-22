let prevScrollOffset = 0;
let headerHeight = $('.navbar .container').height();
let headerOffset = headerHeight;
let notificationOn = false;

export const getHeaderOffset = () => headerOffset;

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
}

export const onResize = ($docsContainer, $parentContainer, $mainContainer) => {
  headerHeight = $('.navbar .container').height();
  setHeight($docsContainer, $parentContainer, $mainContainer);
  headerOffset = headerHeight;
}

export const setHeight = ($docsContainer, $parentContainer, $mainContainer) => {
  $docsContainer.attr('style', 'margin-top: ' + (headerHeight - 54) + 'px !important');
  $parentContainer.attr('style', 'min-height: calc(100vh - ' + (headerHeight + 10) + 'px)');
  $mainContainer.attr('style', 'min-height: calc(100vh - ' + (headerHeight + 12) + 'px)');
}

export const errorNotification = (status, errorThrown) => {
  if (notificationOn === true) return;
  notificationOn = true;
  //close progress bar
  $('#gdc-loading-icon').fadeOut('fast');
  //show the notification alert error
  const $alertError = $('#alert-error');
  $alertError.text('Error ' + status + ': ' + errorThrown);
  $alertError.css({ 'top': (getHeaderOffset() + 20) + 'px' }).addClass('alert__show');
  setTimeout(() => {
    $alertError.removeClass('alert__show');
    notificationOn = false;
  }, 3900);
};

export const dialogsOnResize = ($window) => {
  const dialogs = $('#gdc_data, #gdc_syn_data, #compare_dialog, #caDSR_data, #compareGDC_dialog');
  if (dialogs.length == 0) return;
  dialogs.each((index, element) => {
    const $target = $(element).parent();
    if ($target.offset().top < headerOffset) {
      $target.css('top', (headerOffset + 10) + "px");
    } else if ($window.width() < ($target.offset().left + $target.width())) {
      $target.css('left', ($window.width() - $target.width() - 10) + "px");
    }
  });
}

export const htmlChildContent = (tag, tmpl) =>{
  const re = new RegExp('<'+tag+'>([^]*)<\/'+tag+'>', 'g');
  return re.exec(tmpl)[1];
}

// Remove duplicate synonyms case insensitive
 export const removeDuplicateSynonyms = (it) => {
    if (it.s == undefined) return;
    let cache = {};
    let tmp_s = [];
    it.s.forEach(function (s) {
      let lc = s.trim().toLowerCase();
      if (!(lc in cache)) {
        cache[lc] = [];
      }
      cache[lc].push(s);
    });
    for (let idx in cache) {
      //find the term with the first character capitalized
      let word = findWord(cache[idx]);
      tmp_s.push(word);
    }
    return tmp_s;
}

export const findWord = (words) => {
  let word = "";
  if (words.length == 1) {
    return words[0];
  }
  words.forEach(function (w) {
    if (word !== "") {
      return;
    }
    let idx_space = w.indexOf(" ");
    let idx_comma = w.indexOf(",");
    if (idx_space == -1 && idx_comma == -1) {
      if (/^[A-Z][a-z0-9]{0,}$/.test(w)) {
        word = w;
      }
    }
    else if (idx_space !== -1 && idx_comma == -1) {
      if (/^[A-Z][a-z0-9]{0,}$/.test(w.substr(0, idx_space))) {
        word = w;
      }
    }
    else if (idx_space == -1 && idx_comma !== -1) {
      if (/^[A-Z][a-z0-9]{0,}$/.test(w.substr(0, idx_comma))) {
        word = w;
      }
    }
    else {
      if (idx_comma > idx_space) {
        if (/^[A-Z][a-z0-9]{0,}$/.test(w.substr(0, idx_space))) {
          word = w;
        }
      }
      else {
        if (/^[A-Z][a-z0-9]{0,}$/.test(w.substr(0, idx_comma))) {
          word = w;
        }
      }
    }

  });
  if (word == "") {
    word = words[0];
  }
  return word;
};
