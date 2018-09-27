
let prevScrollOffset = 0;
let headerHeight = $('.navbar .container').height();
let headerOffset = headerHeight;
let notificationOn = false;

export const getHeaderOffset = () => headerOffset;

export const onScroll = ($window) => {
  let currentScrollOffset = $window.scrollTop();
  let delta = currentScrollOffset - prevScrollOffset;

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
  //todo: close progress bar
  $('#gdc-loading-icon').fadeOut('fast');
  //show the notification alert error
  let $alertError = $('#alert-error');
  $alertError.text('Error ' + status + ': ' + errorThrown);
  $alertError.css({ 'top': (getHeaderOffset() + 20) + 'px' }).addClass('alert__show');
  setTimeout(() => {
    $alertError.removeClass('alert__show');
    notificationOn = false;
  }, 3900);
};
