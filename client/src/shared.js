let prevScrollOffset = 0;
let headerHeight = $('.navbar .container').height();
let headerOffset = headerHeight;
let notificationOn = false;

export const getHeaderOffset = () => headerOffset;

export const getScrollTop = () => prevScrollOffset

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
  const dialogs = $('#gdc_data, #gdc_terms_data, #ncit_details, #compare_dialog, #source_details, #type_details');
  if (dialogs.length === 0) return;
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

export const getAllSyn = (items) => {
  items.forEach(em => {
    if(em.n_syn !== undefined){
      em.all_syn = [];
      em.n_syn.forEach(syn => {
        em.all_syn = em.all_syn.concat(syn.s.map(function(x){ return x.termName}));
      });
    }
  });
  return items;
}

export const searchFilter = (items, keyword) => {
  let all_icdo3_syn = getAllSyn(items);
  let new_item = [];
  JSON.parse(JSON.stringify(items)).forEach(item =>{
    let idx = item.n.replace(/<b>/g, "").replace(/<\/b>/g, "").toLowerCase().indexOf(keyword);
    if(idx !== -1){
      if(idx === 0) new_item.unshift(item);
      if(idx !== 0) new_item.push(item);
    }
  });
  // Search in synonyms
  JSON.parse(JSON.stringify(items)).forEach(item =>{
   if(item.s !== undefined){
    let tmp_arr = item.s.map(function(s){return s.termName.trim().toLowerCase()}).map(function(s){ return s.indexOf(keyword) >= 0});
    if(tmp_arr.indexOf(true) >= 0 && !_.some(new_item, item)){
      new_item.push(item);
    }
   }
  });

  // Search in all_syn synonyms if it has icdo3 code
  JSON.parse(JSON.stringify(items)).forEach(item =>{
    if(item.all_syn !== undefined){
      let tmp_arr = item.all_syn.map(function(x){ return x.trim().toLowerCase()}).map(function(s){ return s.indexOf(keyword) >= 0});
      if(tmp_arr.indexOf(true) >= 0 && !_.some(new_item, item)){
        new_item.push(item);
      }
    }
    else if(item.i_c !== undefined && all_icdo3_syn[item.i_c.c] && all_icdo3_syn[item.i_c.c].all_syn){
     let tmp_arr = all_icdo3_syn[item.i_c.c].all_syn.map(function(x){ return x.trim().toLowerCase()}).map(function(s){ return s.indexOf(keyword) >= 0});
     if(tmp_arr.indexOf(true) >= 0 && !_.some(new_item, item)){
       new_item.push(item);
     }
    }
   });

  // Highlight matched values and synonyms
  new_item.forEach(item =>{
    item.n = item.n.replace(/<b>/g, "").replace(/<\/b>/g, "").replace(new RegExp(keyword, "ig"), "<b>$&</b>");
    if(item.s !== undefined){
     item.s = item.s.map(function(s) {return {termName: s.termName.replace(/<b>/g, "").replace(/<\/b>/g, "").replace(new RegExp(keyword, "ig"), "<b>$&</b>"), termGroup: s.termGroup, termSource: s.termSource}});
    }
    if(item.i_c !== undefined && item.i_c.n_syn !== undefined){
      item.i_c.n_syn.forEach(syn => {
        if(syn.s === undefined) return;
        syn.s = syn.s.map(function(x) {return {termName: x.termName.replace(/<b>/g, "").replace(/<\/b>/g, "").replace(new RegExp(keyword, "ig"), "<b>$&</b>"), termGroup: x.termGroup, termSource: x.termSource}});
      })
    }
    if(item.n_syn !== undefined){
      item.n_syn.forEach(syn => {
        if(syn.s === undefined) return;
        syn.s = syn.s.map(function(x) {return {termName: x.termName.replace(/<b>/g, "").replace(/<\/b>/g, "").replace(new RegExp(keyword, "ig"), "<b>$&</b>"), termGroup: x.termGroup, termSource: x.termSource}});
      })
    }
  });
  return new_item;
}

export const searchFilterCR = (items, keyword) => {
  let all_icdo3_syn = getAllSyn(items);
  let new_item = [];
  JSON.parse(JSON.stringify(items)).forEach(item =>{
    let idx = item.n.replace(/<b>/g, "").replace(/<\/b>/g, "").toLowerCase().indexOf(keyword);
    if(idx !== -1){
      if(idx === 0) new_item.unshift(item);
      if(idx !== 0) new_item.push(item);
    }
  });
  // Search in synonyms
  JSON.parse(JSON.stringify(items)).forEach(item =>{
   if(item.s !== undefined){
    let tmp_arr = item.s.map(function(s){return s.termName.trim().toLowerCase()}).map(function(s){ return s.indexOf(keyword) >= 0});
    if(tmp_arr.indexOf(true) >= 0 && !_.some(new_item, item)){
      new_item.push(item);
    }
   }
  });

  // Search in all_syn synonyms if it has icdo3 code
  JSON.parse(JSON.stringify(items)).forEach(item =>{
    if(item.all_syn !== undefined){
      let tmp_arr = item.all_syn.map(function(x){ return x.trim().toLowerCase()}).map(function(s){ return s.indexOf(keyword) >= 0});
      if(tmp_arr.indexOf(true) >= 0 && !_.some(new_item, item)){
        new_item.push(item);
      }
    }
    else if(item.i_c !== undefined && all_icdo3_syn[item.i_c.c] && all_icdo3_syn[item.i_c.c].all_syn){
     let tmp_arr = all_icdo3_syn[item.i_c.c].all_syn.map(function(x){ return x.trim().toLowerCase()}).map(function(s){ return s.indexOf(keyword) >= 0});
     if(tmp_arr.indexOf(true) >= 0 && !_.some(new_item, item)){
       new_item.push(item);
     }
    }
   });

  return new_item;
}

export const sortAlphabetically = (values) => {
  values.sort((a, b) => (a.n.toLowerCase() > b.n.toLowerCase()) ? 1 : ((b.n.toLowerCase() > a.n.toLowerCase()) ? -1 : 0));
  return values;
}

export const getHighlightObj = (highlight) => {
  let highlightObj = {};
  if(highlight !== undefined){
    highlight.forEach(val => {
      let tmp = val.replace(/<b>/g, "").replace(/<\/b>/g, "");
      if(highlightObj[tmp] === undefined) highlightObj[tmp] = val;
    });
  }
  return highlightObj;
}
