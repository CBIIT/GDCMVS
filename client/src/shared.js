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

export const onResize = ($docsContainer, $parentContainer) => {
  headerHeight = $('.navbar .container').height();
  setHeight($docsContainer, $parentContainer);
  headerOffset = headerHeight;
}

export const setHeight = ($docsContainer, $parentContainer) => {
  $docsContainer.attr('style', 'margin-top: ' + (headerHeight - 54) + 'px !important');
  $parentContainer.attr('style', 'min-height: calc(100vh - ' + (headerHeight + 10) + 'px)');
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
