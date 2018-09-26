
let prevScrollOffset = 0;
let headerHeight = $('.navbar .container').height();
let headerOffset = headerHeight;

export const onScroll = ($window) => {
  let currentScrollOffset = $window.scrollTop();
  let delta = currentScrollOffset - prevScrollOffset;

  if(delta > 0) {
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

export const getHeaderOffset = () => headerOffset;
