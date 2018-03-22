
var _prevScrollOffset = 0;
var heightSlider = $('.navbar .container').height();
var windowEl = $(window);
var headerOffset = heightSlider;

function _onScroll() {
  var currentScrollOffset = windowEl.scrollTop();
  var delta = currentScrollOffset - _prevScrollOffset;

  if(delta > 0) {
    headerOffset = heightSlider - 64;
    _prevScrollOffset = currentScrollOffset;
  } else {
    headerOffset = heightSlider;
    _prevScrollOffset = currentScrollOffset;
  }
}


function _onResize() {
  heightSlider = $('.navbar .container').height();
  headerOffset = heightSlider;
}

windowEl.scroll(_onScroll);

windowEl.resize(_onResize);

const func = {
  headerOffset() { return headerOffset },
}

export default func;
