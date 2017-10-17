/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
const baseUrl = './search';

const api = {
  suggest(value, callback) {
    $.getJSON({
  	url: baseUrl + "/suggest?keyword=" + value,
  	success: function(data) {
  		//console.log(data);
  	  callback(data);
  	}
    });
  },
  searchAll(keyword, option, callback) {
    $.getJSON(baseUrl + '/all/p', {keyword:keyword, option: JSON.stringify(option)}, function(result){
        let items = result;
        callback(keyword, option, items);
      });
  },
  getGDCDataById(id, callback){
    $.getJSON(baseUrl + '/p/local/vs', {id:id}, function(result){
        callback(id,result);
      });
  },
  getCDEDataById(id, callback){
    $.getJSON(baseUrl + '/p/cde/vs', {id:id}, function(result){
        callback(id,result);
      });
  },
  getGDCandCDEDataById(ids, callback){
    $.getJSON(baseUrl + '/p/both/vs', {local:ids.local, cde: ids.cde}, function(result){
        callback(ids,result);
      });
  }
}

/* harmony default export */ __webpack_exports__["a"] = (api);


/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__search_bar___ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__dialog___ = __webpack_require__(13);




$("#search").bind("click", __WEBPACK_IMPORTED_MODULE_0__search_bar___["a" /* default */].search);

$("#keywords").bind("keypress", __WEBPACK_IMPORTED_MODULE_0__search_bar___["a" /* default */].gotoSearch);

$("#keywords").bind("keydown", __WEBPACK_IMPORTED_MODULE_0__search_bar___["a" /* default */].selectSuggestion);

$("#keywords").bind("input", __WEBPACK_IMPORTED_MODULE_0__search_bar___["a" /* default */].suggest);

$(document).on('click',__WEBPACK_IMPORTED_MODULE_0__search_bar___["a" /* default */].removeBox);

var heightSlider = $('.navbar .container').height();
$('#body').attr('style', 'margin-top: '+ (heightSlider - 44) +'px !important');

$(window).resize(function() {
  heightSlider = $('.navbar .container').height();
  $('#body').attr('style', 'margin-top: '+ (heightSlider - 44) +'px !important');
});

function getGDCData(prop, target){
	let uid = prop.replace(/@/g, '/');
	__WEBPACK_IMPORTED_MODULE_1__dialog___["a" /* default */].getGDCData(uid, target);
}

window.getGDCData = getGDCData;

function getGDCSynonyms(prop, targets){
	let uid = prop.replace(/@/g, '/');
	__WEBPACK_IMPORTED_MODULE_1__dialog___["a" /* default */].getGDCSynonyms(uid, targets);
};

window.getGDCSynonyms = getGDCSynonyms;

function toCompare(prop){
	let uid = prop.replace(/@/g, '/');
	__WEBPACK_IMPORTED_MODULE_1__dialog___["a" /* default */].toCompare(uid);
};

window.toCompare = toCompare;

function compare(gv){
    if($('#cp_input').val().trim() === ''){
        $('#cp_massage').css("display", "block");
        $("#cp_massage").removeClass();
        $('#cp_massage').addClass("div-message");
        $('#cp_massage').html("Please type in user defined values.");
        return;
    }
    else{
        //compare and render
        $('#cp_massage').css("display", "none");
        $("#cp_massage").removeClass();
        $('#cp_massage').html("");
        $('#compare_form').css("display", "none");
        $('#compare_result').css("display", "block");
        let vs = $('#cp_input').val().split(/\n/);

        let opt = {};
        opt.sensitive = false;
        opt.unmatched = false;
        let table = generateCompareResult(vs, gv, opt);
        let html = '<div class="cp_result_title">Compare Result</div>'
                    +'<div id="cp_result_option"><div class="option-left"><input type="checkbox" id="compare_filter"> Case Sensitive</div><div class="option-right"><input type="checkbox" id="compare_unmatched"> Hide Unmatched Values</div></div>'
                    +'<div class="clearfix"></div>'
                    +'<div id="cp_result_table" class="table-container">'+table+'</div>'
                    +'<div id="cp_result_bottom"><button id="back2Compare" class="btn btn-default btn-submit-large">Back</button>'
                    +'</div>';
        $('#compare_result').html(html);

        // let h = $('#cp_result_table table:first-child').height() +1;
        // if(h >= 30 * 12.8){
        //     h = 384;
        // }
        //$('#cp_result_table').height(h+'px');
        $('#compare_filter').bind('click', function(){
            let options = {};
            options.sensitive = $("#compare_filter").prop('checked');
            options.unmatched = $("#compare_unmatched").prop('checked');
            let table_new = generateCompareResult(vs, gv, options);
            $('#cp_result_table').html(table_new);
            // let h = $('#cp_result_table table:first-child').height() +1;
            // if(h >= 30 * 12.8){
            //     h = 384;
            // }
            // $('#cp_result_table').height(h+'px');
        });
        $('#compare_unmatched').bind('click', function(){
            let options = {};
            options.sensitive = $("#compare_filter").prop('checked');
            options.unmatched = $("#compare_unmatched").prop('checked');
            let table_new = generateCompareResult(vs, gv, options);
            $('#cp_result_table').html(table_new);
            // let h = $('#cp_result_table table:first-child').height() +1;
            // if(h >= 30 * 12.8){
            //     h = 384;
            // }
            // $('#cp_result_table').height(h+'px');
        });
        $('#back2Compare').bind('click', function(){
            $('#compare_result').html("");
            $('#compare_result').css("display", "none");
            $('#compare_form').css("display", "block");
        });

    }
};

window.compare = compare;

function generateCompareResult(fromV, toV, option){
    let v_lowercase = [], v_matched = [];
    if(option.sensitive){
        toV.forEach(function(v){
            v_lowercase.push(v.trim());
        });
    }
    else{
        toV.forEach(function(v){
            v_lowercase.push(v.trim().toLowerCase());
        });
    }

        let table = '<div class="table-thead row">'
                  +'<div class="table-th col-xs-6">User Defined Values</div>'
                  +'<div class="table-th col-xs-6">Matched GDC Values</div>'
                +'</div>'
                +'<div class="table-body row" style="height: 350px;">'
                  +'<div class="col-xs-12">';

    //let table = '<table width="100%"><tbody><tr class="data-table-head center"><td width="50%" style="text-align:left;">User Defined Values</td><td width="50%" style="text-align:left;">Matched GDC Values</td></tr>';

    fromV.forEach(function(v){
        let tmp = $.trim(v);
        if(tmp ===''){
            return;
        }
        let text = '';
        let idx = option.sensitive ? v_lowercase.indexOf(tmp) : v_lowercase.indexOf(tmp.toLowerCase());
        if(idx >= 0){
            text = toV[idx];
            v_matched.push(idx);
        }
        if(text ===''){
            text = '<div style="color:red;">--</div>';
            //table += '<tr class="data-table-row"><td align="left">'+v+'</td><td align="left">'+text+'</td></tr>';
            table += '<div class="table-row row">'
              +'<div class="table-td td-slim col-xs-6">'+v+'</div>'
              +'<div class="table-td td-slim col-xs-6">'+text+'</div>'
            +'</div>';
        }
        else{
            //table += '<tr class="data-table-row"><td align="left">'+v+'</td><td align="left"><b>'+(idx+1)+'.</b>'+text+'</td></tr>';
            table += '<div class="table-row row">'
              +'<div class="table-td td-slim col-xs-6">'+v+'</div>'
              +'<div class="table-td td-slim col-xs-6">'+text+'</div>'
            +'</div>';
        }
    });
    for(var i = 0; i< toV.length; i++){
        if(v_matched.indexOf(i) >= 0){
            continue;
        }
        //table += '<tr class="data-table-row '+(option.unmatched ? 'row-undisplay' : '')+'"><td align="left"><div style="color:red;">--</div></td><td align="left"><b>'+(i+1)+'.</b>'+toV[i]+'</td></tr>';
        table += '<div class="table-row row '+(option.unmatched ? 'row-undisplay' : '')+'">'
              +'<div class="table-td td-slim col-xs-6"><div style="color:red;">--</div></div>'
              +'<div class="table-td td-slim col-xs-6">'+toV[i]+'</div>'
            +'</div>';
    }       
    table += '</div></div>'
    //table += "</tbody></table>";
    return table;
};

window.generateCompareResult = generateCompareResult;

function generateCompareGDCResult(fromV, toV, option){
    let v_lowercase = [], v_matched = [];
    let from_num = 0;
    if(option.sensitive){
        toV.forEach(function(v){
            v_lowercase.push(v.trim());
        });
    }
    else{
        toV.forEach(function(v){
            v_lowercase.push(v.trim().toLowerCase());
        });
    }

    let table = '<div class="table-thead row">'
                  +'<div class="table-th col-xs-6">GDC Values</div>'
                  +'<div class="table-th col-xs-6">Matched caDSR Values</div>'
                +'</div>'
                +'<div class="table-body row" style="height: 350px;">'
                  +'<div class="col-xs-12">';

    //table += '<table width="100%"><tbody><tr class="data-table-head center"><td width="50%" style="text-align:left;">GDC Values</td><td width="50%" style="text-align:left;">Matched caDSR Values</td></tr>';

    fromV.forEach(function(v){
        let tmp = $.trim(v);
        if(tmp ===''){
            return;
        }
        let text = '';
        let idx = option.sensitive ? v_lowercase.indexOf(tmp) : v_lowercase.indexOf(tmp.toLowerCase());
        if(idx >= 0){
            text = toV[idx];
            v_matched.push(idx);
        }
        if(text ===''){
            text = '<div style="color:red;">--</div>';
            table += '<div class="table-row row">'
                      +'<div class="table-td td-slim col-xs-6">'+v+'</div>'
                      +'<div class="table-td td-slim col-xs-6">'+text+'</div>'
                    +'</div>';
            //table += '<tr class="data-table-row"><td align="left"><b>'+(++from_num)+'.</b>'+v+'</td><td align="left">'+text+'</td></tr>';
        }
        else{
            table += '<div class="table-row row">'
                      +'<div class="table-td td-slim col-xs-6">'+v+'</div>'
                      +'<div class="table-td td-slim col-xs-6">'+text+'</div>'
                    +'</div>';
            //table += '<tr class="data-table-row"><td align="left"><b>'+(++from_num)+'.</b>'+v+'</td><td align="left"><b>'+(idx+1)+'.</b>'+text+'</td></tr>';
        }
    });
    for(var i = 0; i< toV.length; i++){
        if(v_matched.indexOf(i) >= 0){
            continue;
        }
        table += '<div class="table-row row '+(option.unmatched ? 'row-undisplay' : '')+'">'
                      +'<div class="table-td  td-slim col-xs-6"><div style="color:red;">--</div></div>'
                      +'<div class="table-td td-slim col-xs-6">'+toV[i]+'</div>'
                    +'</div>';
        //table += '<tr class="data-table-row '+(option.unmatched ? 'row-undisplay' : '')+'"><td align="left"><div style="color:red;">--</div></td><td align="left"><b>'+(i+1)+'.</b>'+toV[i]+'</td></tr>';
    }
    //table += "</tbody></table>";
    table += '</div></div>'

    return table;
};

window.generateCompareGDCResult = generateCompareGDCResult;

function getCDEData(cdeId, targets){
    __WEBPACK_IMPORTED_MODULE_1__dialog___["a" /* default */].getCDEData(cdeId, targets);
}

window.getCDEData = getCDEData;

function compareGDC(prop, cdeId){
    let uid = prop.replace(/@/g, '/');
    __WEBPACK_IMPORTED_MODULE_1__dialog___["a" /* default */].compareGDC(uid, cdeId);
};

window.compareGDC = compareGDC;

//find the word with the first character capitalized
function findWord (words){
    let word = "";
    if(words.length == 1){
        return words[0];
    }
    words.forEach(function(w){
        if(word !== ""){
            return;
        }
        let idx_space = w.indexOf(" ");
        let idx_comma = w.indexOf(",");
        if(idx_space == -1 && idx_comma == -1){
            if(/^[A-Z][a-z0-9]{0,}$/.test(w)){
                word = w;
            }
        }
        else if(idx_space !== -1 && idx_comma == -1){
            if(/^[A-Z][a-z0-9]{0,}$/.test(w.substr(0, idx_space))){
                word = w;
            }
        }
        else if(idx_space == -1 && idx_comma !== -1){
            if(/^[A-Z][a-z0-9]{0,}$/.test(w.substr(0, idx_comma))){
                word = w;
            }
        }
        else{
            if(idx_comma > idx_space){
                if(/^[A-Z][a-z0-9]{0,}$/.test(w.substr(0, idx_space))){
                    word = w;
                }
            }
            else{
                if(/^[A-Z][a-z0-9]{0,}$/.test(w.substr(0, idx_comma))){
                    word = w;
                }
            }
        }
        
    });
    if(word == ""){
        word = words[0];
    }
    return word;
};

window.findWord = findWord;


/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__api__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__render__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__view__ = __webpack_require__(12);




let displayBoxIndex = -1;
let activeTab = 0;

const func = {
    search(){
        let keyword = $("#keywords").val();

        if(keyword == ""){
            $('#form-search').addClass('has-error');
            $('#form-search .invalid-feedback').css({'display': 'block'});
            return;
        }

        keyword = keyword.toLowerCase();
        //get selected tab
        let count = 0;
        $("li[role='presentation']").each(function(){
            if($(this).hasClass("active")){
                activeTab = count;
            }
            count++;
        });
        let option = {};
        option.desc = $("#i_desc").prop('checked');
        option.syn = $("#i_syn").prop('checked');
        option.match = $("input[name=i_match]:checked").val();
        option.activeTab = activeTab;
        $("#suggestBox").css("display","none");
        displayBoxIndex = -1;
        //todo:show progress bar
        $('#gdc-loading-icon').fadeIn(100);
        __WEBPACK_IMPORTED_MODULE_0__api__["a" /* default */].searchAll(keyword, option, function(keyword, option, items) {
          //console.log(items);
          Object(__WEBPACK_IMPORTED_MODULE_1__render__["a" /* default */])(keyword, option, items);
          //todo: close progress bar
          $('#gdc-loading-icon').fadeOut('fast');
        });
    },
    gotoSearch(e){
        if(e.keyCode == 13){
            e.preventDefault();
        }
        if(e.keyCode == 13 && $("#suggestBox .selected").length !== 0){
            // let idx = $("#suggestBox .selected").html().indexOf("<label>");
            let t = $("#suggestBox .selected").text();
            $("#keywords").val(t.substr(0,t.length-1));
            $("#search").trigger("click");
        }
        else if (e.keyCode == 13) {
            $("#search").trigger("click");
        }
    },
    selectSuggestion(e){
        if ((e.keyCode == 40 || e.keyCode == 38) && $(this).val().trim() !== "" && document.getElementById("suggestBox").style.display !== "none") {
            e.preventDefault();
            //focus to the first element

            displayBoxIndex += (e.keyCode == 40 ? 1 : -1);
            let oBoxCollection = $("#suggestBox").find("div");
            if (displayBoxIndex >= oBoxCollection.length)
                 displayBoxIndex = 0;
            if (displayBoxIndex < 0)
                 displayBoxIndex = oBoxCollection.length - 1;
            let cssClass = "selected";
            oBoxCollection.removeClass(cssClass).eq(displayBoxIndex).addClass(cssClass);
        }
    },
    suggest(){
        let area = document.getElementById("suggestBox");
        
        if($("#form-search").hasClass('has-error')){
            $("#form-search").removeClass('has-error');
            $('#form-search .invalid-feedback').removeAttr('style');
        }

        if($(this).val().trim() === ''){
            area.style.display = "none";
            displayBoxIndex = -1;
            area.innerHTML = "";
            return;
        }
        $.getJSON('./search/suggest', {keyword:$(this).val()}, function(result){
            if(result.length === 0){
                area.style.display = "none";
                displayBoxIndex = -1;
                area.innerHTML = "";
                return;
            }
            
            area.style.display = "block";
            let html = $.templates(__WEBPACK_IMPORTED_MODULE_2__view__["a" /* default */]).render({options: result });;
            displayBoxIndex = -1;
            area.innerHTML = html;
            area.onclick = function(e){
                let t = $(e.target).text();
                $("#keywords").val(t);
                $("#keywords").focus();
            };
        });
    },
    removeBox(e){
        if($(e.target) != $("#suggestBox")){
            $("#suggestBox").css("display","none");
            displayBoxIndex = -1;
        }
    }
}

/* harmony default export */ __webpack_exports__["a"] = (func);


/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = render;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__result_table___ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__props_table___ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__values_table___ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__tabs___ = __webpack_require__(10);





function render(keyword, option, items){
  let html = "";
  if(items.length !== 0){
  	let trsHtml = __WEBPACK_IMPORTED_MODULE_0__result_table___["a" /* default */].render(items);
    trsHtml.active = false;
  	let psHtml = __WEBPACK_IMPORTED_MODULE_1__props_table___["a" /* default */].render(items);
    psHtml.active = false;
  	let vsHtml = __WEBPACK_IMPORTED_MODULE_2__values_table___["a" /* default */].render(items);
    vsHtml.active = false;
    if(option.activeTab == 0){
        trsHtml.active = true;
    }
    else if(option.activeTab == 1){
        psHtml.active = true;
    }
    else{
        vsHtml.active = true;
    }
  	html = Object(__WEBPACK_IMPORTED_MODULE_3__tabs___["a" /* default */])(trsHtml, psHtml, vsHtml);
  }
  else{
  	html = '<div class="info">No result found for keyword: '+keyword+'</div>';
  }
  
  $("#root").html(html);
  
  if($("#tree_table").length){
      $("#tree_table").treetable({expandable: true});
      $("#collapse").bind("click", function(){
          $("#tree_table").find('a[title="Collapse"]').each(function(){
              $(this).trigger("click");
          });

      });

      $("#expand").bind("click", function(){
          $("#tree_table").find('a[title="Expand"]').each(function(){
              $(this).trigger("click");
          });
          $("#tree_table").find('a[title="Expand"]').each(function(){
              $(this).trigger("click");
          });
          $("#tree_table").find('a[title="Expand"]').each(function(){
              $(this).trigger("click");
          });

      });
  }

  let htmlShow = '';

  $('.show-more-less').click(function () {
    let target = $(this);

    let parentTable = $(this).parent().parent().parent();
    let targets = parentTable.find('.row-toggle');
    if(target.hasClass('more')){
      target.removeClass('more');
      targets.css({display: 'none'});
      target.html(htmlShow == ''? '<i class="fa fa-angle-down"></i> Show More' : htmlShow);
    } else {
      htmlShow = target.html();
      target.addClass('more');
      targets.css({display: 'flex'});
      target.html('<i class="fa fa-angle-up"></i> Show Less');
    }
  });

  $('.cde-collapser').click(function(){
    let target = $(this);
    let parentTable = $(this).parent().parent().parent();

    let gdeContainer = parentTable.find('#cde-content');

    gdeContainer.slideToggle(400, function(){
      if(gdeContainer.is(":visible")){
        target.html('<i class="fa fa-minus"></i>');
      }else{
        target.html('<i class="fa fa-plus"></i>');
      }
    });
  });


  $('.gdc-details').click(function(){
    let target = $(this);
    let parentTarget = $(this).parent();
    let gdcLinks = parentTarget.find('#gdc-links');
    gdcLinks.slideToggle(400);
  });

  let hiddenRows = $('#tree_table').find('.data-hide');
  $('#trs-checkbox').click(function(){
    if(this.checked){
      hiddenRows.each(function(){
        $(this).removeClass('hide');
      });
    }else{
      hiddenRows.each(function(){
        $(this).addClass('hide');
      });
    }
  });

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

  windowEl.scroll(_onScroll);

  $('.cde-suggest').click(function(){
    var alertSuggest = $('#alert-suggest');
    alertSuggest.removeClass('animated fadeInDownUp').css({'display': 'none'});
    var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
    alertSuggest.css({'display': 'block', 'top': (headerOffset + 20 ) + 'px'}).addClass('animated fadeInDownUp').one(animationEnd, function() {
      alertSuggest.css({'display': 'none'})
    });
  });

  // $('#table-body').scroll(function() {
  //   console.log('true');

  //   let vsTapTop = $('#vsTab').offset().top + 88;
  //   let vsTapBotton=  vsTapTop + $('#vsTab').height();

  //   $('.table-row').each(function(){
  //     var t = $(this);
  //     var thisTop = t.offset().top;
  //     var thisBotton = thisTop + t.height();
  //     var property =  t.find('.property');

  //     console.log('vsTapTop' + vsTapTop + 'vsTapBotton' + vsTapBotton +  'thisTop' + thisTop + 'thisBotton' + thisBotton)
  //     if(thisBotton > vsTapTop && thisBotton < vsTapBotton || thisTop < vsTapTop && thisTop > vsTapTop || thisTop < vsTapTop && thisBotton > vsTapBotton ){
  //       console.log(property);
  //       if(thisTop < vsTapTop || thisTop < vsTapTop && thisBotton > vsTapTop || thisTop < vsTapTop && thisBotton > vsTapBotton  )
  //         property.attr('style','opacity: 100; position: relative; top: '+ (vsTapTop - thisTop )+'px;');
  //       else{
  //         property.attr('style','opacity: 100; position: relative; top: 0');
  //       }
  //     }
  //     else{
  //       property.attr('style','opacity: 0;'); //property.hide();
  //     }
  //   });
  // });
  
}


/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__view__ = __webpack_require__(5);


const func = {
  render(items) {
 	//data preprocessing
 	//current category
 	let c_c = "";
 	//current node
 	let c_n = "";
 	//prefix for property and value id
 	let count = 0;
 	//data generated
 	let trs = [];
 	items.forEach(function(item){
 		let hl = item.highlight;
        let source = item._source;
        let enum_s = ("enum.s" in hl) || ("enum.s.have" in hl) ? hl['enum.s'] || hl["enum.s.have"] : [];
        let enum_n = ("enum.n" in hl) || ("enum.n.have" in hl) ? hl["enum.n"] || hl["enum.n.have"] : [];
        let cde_s = ("cde_pv.ss.s" in hl) || ("cde_pv.ss.s.have" in hl) ? hl["cde_pv.ss.s"] || hl["cde_pv.ss.s.have"] : [];
        let arr_enum_s = [];
        let arr_enum_n = [];
        let arr_cde_s = [];
        let matched_pv = [];
        let cde2local = false;
        enum_s.forEach(function(s){
            let tmp = s.replace(/<b>/g,"").replace(/<\/b>/g, "");
            arr_enum_s.push(tmp);
        });
        enum_n.forEach(function(n){
            let tmp = n.replace(/<b>/g,"").replace(/<\/b>/g, "");
            arr_enum_n.push(tmp);
        });
        cde_s.forEach(function(ps){
            let tmp = ps.replace(/<b>/g,"").replace(/<\/b>/g, "");
            arr_cde_s.push(tmp);
        });

 		if(source.cde_pv !== undefined && source.cde_pv.length > 0){
            source.cde_pv.forEach(function(pv){
                let exist = false;
                if(pv.ss !== undefined && pv.ss.length > 0){
                    pv.ss.forEach(function(ss){
                        ss.s.forEach(function(s){
                            if(arr_cde_s.indexOf(s) !== -1) {
                                exist = true;
                            }
                        })
                    });
                }
                if(exist){
                    matched_pv.push(pv.n);
                    if(source.enum !== undefined){
                        source.enum.forEach(function(em){
                            if(cde2local){
                                return;
                            }
                            if(em.n == pv.n){
                                cde2local = true;
                            }
                        });
                    }
                    
                }
            });
        }

 		if(source.category != c_c){
 			//put category to tree table
 			c_c = source.category;
	        let c = {};
	        c.id = c_c;
	        c.title = c_c;
	        c.desc = "";
	        c.data_tt_id = c.id;
	        c.data_tt_parent_id = "--";
	        c.type = "category";
	        c.node = "branch";
	        trs.push(c);
 		}
 		if(source.node != c_n){
 			//put node to tree table
 			c_n = source.node;
 			let n = {};
 			//link id
 			n.l_id = source.node;
            n.id = source.node;
            n.title = source.n_title;
            n.desc = source.n_desc;
            n.data_tt_id = n.id;
            n.data_tt_parent_id = c_c;
            n.type = "folder";
            n.node = "branch";
            trs.push(n);
 		}
 		//put property to tree table
 		let p = {};
 		count++;
 		p.id = count + "_" + source.name;
 		//may have highlighted terms in p.title and p.desc
        p.title = ("name" in hl) || ("name.have" in hl) ? (hl["name"] || hl["name.have"]) : source.name;
        p.desc = ("desc" in hl) ? hl["desc"] : source.desc;
 		p.data_tt_id = p.id;
        p.data_tt_parent_id = c_n;
        p.type="property";
        //put value to tree table
        if(enum_n.length == 0 && enum_s.length == 0 && !cde2local){
            //if no values show in the values tab
            p.node = "leaf";
            trs.push(p);
        }
        else if(source.enum !== undefined){
        	p.node = "branch";
        	trs.push(p);
        	//show values, need to highlight if necessary
        	let list = [];
            if(("enum.n" in hl) || ("enum.n.have" in hl)){
                list = hl["enum.n"] || hl["enum.n.have"];
            }
            let enums = {};
            list.forEach(function(em){
                let e = em.replace(/<b>/g,"").replace(/<\/b>/g, "");
                enums[e] = em;
            });
            let values = source.enum;
            values.forEach(function(v){
            	count++;
            	let e = {}; 
            	e.id = count + "_"+ v.n;

                if(arr_enum_n.indexOf(v.n) !== -1 || matched_pv.indexOf(v.n) !== -1) {
                    e.exist = true;
                }

                if(v.s !== undefined && e.exist != true){
                    v.s.forEach(function(syn){
                        if(arr_enum_s.indexOf(syn) !== -1) {
                            e.exist = true;
                        }
                    });
                }

                // if(e.exist){
                //     p.node = "branch novalues";
                // }
            	//may be highlighted
            	e.title = (v.n in enums) ? enums[v.n] : v.n;
            	e.desc = "";
            	e.data_tt_id = e.id;
            	e.data_tt_parent_id = p.id;
            	e.type = "value";
            	e.node = "leaf";
            	trs.push(e);
            });
        }
        else if(source.cde !== undefined){
        	p.node = "branch";
        	trs.push(p);
        	//show caDSR reference
        	count++;
            let l = {};
            l.id = count + "_l";
            l.l_id = source.cde.id;
            l.l_type = "cde";
            l.url = source.cde.url;
            l.desc = "";
            l.data_tt_id = l.id;
            l.data_tt_parent_id = p.id;
            l.type = "link";
            l.node = "leaf";
            trs.push(l);
        }
        else if(source.ncit !== undefined){
        	p.node = "branch";
        	trs.push(p);
        	//show NCIt reference
        	count++;
            let l = {};
            l.id = count + "_l";
            l.l_id = source.ncit.id;
            l.l_type = "ncit";
            l.url = source.ncit.url;
            l.desc = "";
            l.data_tt_id = l.id;
            l.data_tt_parent_id = p.id;
            l.type = "link";
            l.node = "leaf";
            trs.push(l);
        }
        else{
        	p.node = "leaf";
        	trs.push(p);
        }
 	});

 	let offset = $('#root').offset().top;
    let h = window.innerHeight - offset - 110;
    h = (h < 550) ? 550 : h;

    let html = $.templates(__WEBPACK_IMPORTED_MODULE_0__view__["a" /* default */]).render({mh:h,trs: trs});
    let result = {};
    result.len = 0;
    result.html = html;
    return result;

  }
};

/* harmony default export */ __webpack_exports__["a"] = (func);

/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";

let tmpl = '<div class="container table-container">'
			+'<div id="table_results" style="display: block;">'
				+'<div class="btn-container">'
					+'<button id="collapse" class="btn btn-default btn-list" style="margin-right:5px;">Collapse all</button>'
					+'<button id="expand" class="btn btn-default btn-list">Expand all</button>'
					+'<div class="checkbox trs-checkbox"><label><input id="trs-checkbox" type="checkbox" value>Show all values</label></div>'
				+'</div>'
				+'<div class="table-thead row">' 
					+'<div class="col-xs-4"><div class="table-th">Name</div></div>' 
					+'<div class="col-xs-8"><div class="table-th">Description</div></div>'
				+'</div>'
				+'<div class="row">'
					+'<table class="data-table treetable" id="tree_table" border ="0" cellPadding="0" cellSpacing="0" width="100%" style="display:table; margin: 0px;">'
						+'<tbody style="max-height: {{:mh}}px; overflow-y: auto; width:100%; display:block;">'
						+'{{for trs}}'
						+'<tr key="{{:id}}" data-tt-id="{{:data_tt_id}}" data-tt-parent-id="{{:data_tt_parent_id}}" class="data-table-row {{:node}} {{if exist != true && type == "value"}}data-hide hide{{/if}}" style="width:100%; float:left;">'
						+'<td width="33%" style="width:33%; float:left; display:flex; align-items: center;">'
						+'<span class="{{:type}}" style="display:inline-block; width: 70%;">'
						+'{{if type == "folder"}}'
						+'<a href="https://docs.gdc.cancer.gov/Data_Dictionary/viewer/#?view=table-definition-view&id={{:l_id}}" target="_blank">{{:title}}</a>'
						+'{{else type == "link"}}'
							+'{{if l_type == "cde"}}'
							+'No values in GDC, reference values in <a href="javascript:getCDEData(\'{{:l_id}}\');" class="table-td-link">caDSR</a>'
							+'{{else}}'
							+'No values in GDC, concept referenced in <a target="_blank" href="{{:url}}" class="table-td-link">NCIt</a>'
							+'{{/if}}'
			            +'{{else}}'
			            +'{{:title}}'
			            +'{{/if}}'
			            +'</td>'
			            +'<td width="66%" style="width:66%; float:left; line-height: 22px;">'
			            +'{{:desc}}'
			            +'</td>'
			            +'</tr>'
						+'{{/for}}'
						+'</tbody>'
					+'</table>'
				+'</div>'
			+'</div>'
		+'</div>';

/* harmony default export */ __webpack_exports__["a"] = (tmpl);

/***/ }),
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__view__ = __webpack_require__(7);


const func = {
  render(items) {
 	//data preprocessing
 	let props = [];
 	items.forEach(function(item){
 		let hl = item.highlight;
 		let source = item._source;
 		if(("name" in hl) || ("name.have" in hl) || ("desc" in hl)){
 			let prop = {};
 			prop.nm = ("name" in hl) || ("name.have" in hl) ? (hl["name"] || hl["name.have"]) : source.name;
 			prop.nd = source.node;
 			prop.ct = source.category;
 			prop.desc = ("desc" in hl) ? hl["desc"] : source.desc;
 			prop.local = source.enum == undefined ? false : true;
 			prop.syn = false;
 			if(source.enum !== undefined){
 				//check if synonyms exists
 				source.enum.forEach(function(em){
 					if(prop.syn) return;

 					if(em.n_c !== undefined){
 						prop.syn = true;
 					}
 				});	
 			}
 			prop.ref = source.name +"@" +source.node +"@" + source.category;
 			prop.cdeId = source.cde !== undefined ? source.cde.id : "";
 			prop.cdeUrl = source.cde !== undefined ? source.cde.url : "";
 			prop.cdeLen = source.cde_pv == undefined || source.cde_pv.length == 0 ? false : true;
 			prop.type =  Array.isArray(source.type) ? source.type[0] : source.type;
 			props.push(prop);
 		}
 	});
 	let html = "";
 	if(props.length == 0){
 		let keyword = $("#keywords").val();
 		html = '<div class="info">No result found for keyword: '+keyword+'</div>';
 	}
 	else{
 		let offset = $('#root').offset().top;
 		let h = window.innerHeight - offset - 110;
 		h = (h < 550) ? 550 : h;

 		html = $.templates(__WEBPACK_IMPORTED_MODULE_0__view__["a" /* default */]).render({mh:h,props: props});
 	}
 	
    let result = {};
    result.len = props.length;
    result.html = html;
    return result;
    
  }
};

/* harmony default export */ __webpack_exports__["a"] = (func);

/***/ }),
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";

let tmpl = '<div class="container table-container"><div class="table-thead row">'
  +'<div class="table-th col-xs-2">Category / Node</div>'
  +'<div class="table-th col-xs-2">Property</div>'
  +'<div class="table-th col-xs-5">Description</div>'
  +'<div class="table-th col-xs-2">GDC Property Values</div>'
  +'<div class="table-th col-xs-1">CDE Reference</div>'
+'</div>'
+'<div class="row table-body" style="max-height: {{:mh}}px;"><div class="col-xs-12">'
+'{{for props}}'
+'<div class="table-row row">'
  +'<div class="table-td col-xs-2">{{:ct}}<ul><li class="word-break">{{:nd}}</li></ul></div>'
  +'<div class="table-td col-xs-2 word-break">{{:nm}}</div>'
  +'<div class="table-td col-xs-5">{{:desc}}</div>'
  +'<div class="table-td col-xs-2">'
  +'{{if local}}'
  +'<a href="javascript:getGDCData(\'{{:ref}}\',null);">See All Values</a>'
  +'<br><a href="javascript:toCompare(\'{{:ref}}\');"> Compare with User List</a>'
    +'{{if syn}}'
    +'<br><a href="javascript:getGDCSynonyms(\'{{:ref}}\',null);">See All Synonyms</a>'
    +'{{else}}'
    +'{{/if}}'
  +'{{else}}'
  +'type: {{:type}}'
  +'{{/if}}'
  +'</div>' 
  +'<div class="table-td col-xs-1">'
  +'{{if cdeId == ""}}'
  +''
  +'{{else}}'
  +'caDSR: <a class="table-td-link" href="{{:cdeUrl}}" target="_blank">CDE</a>'
    +'{{if local && cdeLen}}'
    +' , <a class="table-td-link" href="javascript:getCDEData(\'{{:cdeId}}\',null);">Values</a> , <a class="table-td-link" href="javascript:compareGDC(\'{{:ref}}\',\'{{:cdeId}}\');"> Compare with GDC</a>'
    +'{{else cdeLen}}'
    +' , <a class="table-td-link" href="javascript:getCDEData(\'{{:cdeId}}\',null);">Values</a>'
    +'{{else}}'
    +''
    +'{{/if}}'
  +'{{/if}}'
  +'</div>'
+'</div>'
+'{{/for}}</div></div></div>';
  
/* harmony default export */ __webpack_exports__["a"] = (tmpl);

/***/ }),
/* 8 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__view__ = __webpack_require__(9);


const func = {
  render(items) {
 	//data preprocessing

	let values = [];
	items.forEach(function (item){
	  	let hl = item.highlight;
	  	if(hl["enum.n"] == undefined && hl["enum.n.have"] == undefined && hl["enum.s"] == undefined && hl["enum.s.have"] == undefined 
	  		&& hl["cde_pv.ss.s"] == undefined && hl["cde_pv.ss.s.have"] == undefined 
	  		&& hl["enum.i_c.c"] == undefined && hl["enum.i_c.have"] == undefined){
	  		return;
		}
	  	let source = item._source;
	  	let dict_enum_n = {};
		let dict_enum_s = {};
		let dict_cde_s = {};
		let arr_enum_c = [];
		let arr_enum_c_have = [];
		//each row in the values tab will be put into values
		let row = {};
		row.category = source.category;
		row.node =  source.node;
		row.name = source.name;
		row.local = source.enum == undefined ? false : true;
		row.syn = false;
		if(source.enum !== undefined){
			//check if synonyms exists
			source.enum.forEach(function(em){
				if(row.syn) return;

				if(em.n_c !== undefined){
					row.syn = true;
				}
			});	
		}
		row.ref = source.name +"@" +source.node +"@" + source.category;
		row.cdeId = source.cde !== undefined ? source.cde.id : "";
		row.cdeUrl = source.cde !== undefined ? source.cde.url : "";
		row.cdeLen = source.cde_pv == undefined || source.cde_pv.length == 0 ? false : true;
		//value informations in the subtable
		row.vs = [];
		row.tgts_enum_n = ""; //added
		row.tgts_cde_n = "";
	  	let enum_n = ("enum.n" in hl) || ("enum.n.have" in hl) ? hl["enum.n"] || hl["enum.n.have"] : [];
		let enum_s = ("enum.s" in hl) || ("enum.s.have" in hl) ? hl['enum.s'] || hl["enum.s.have"] : [];
		let cde_s = ("cde_pv.ss.s" in hl) || ("cde_pv.ss.s.have" in hl) ? hl["cde_pv.ss.s"] || hl["cde_pv.ss.s.have"] : [];
		let enum_c = ("enum.i_c.c" in hl) ? hl["enum.i_c.c"] : [];
		let enum_c_have = ("enum.i_c.have" in hl) ? hl["enum.i_c.have"] : [];
		enum_n.forEach(function(n){
			let tmp = n.replace(/<b>/g,"").replace(/<\/b>/g, "");
			dict_enum_n[tmp] = n;
		});
		enum_s.forEach(function(s){
			let tmp = s.replace(/<b>/g,"").replace(/<\/b>/g, "");
			dict_enum_s[tmp] = s;
		});
		cde_s.forEach(function(ps){
			let tmp = ps.replace(/<b>/g,"").replace(/<\/b>/g, "");
			dict_cde_s[tmp] = ps;
		});
		enum_c.forEach(function(c){
			let tmp = c.replace(/<b>/g,"").replace(/<\/b>/g, "");
			if(arr_enum_c.indexOf(tmp) == -1){
				arr_enum_c.push(tmp);
			}
		});
		enum_c_have.forEach(function(ch){
			let tmp = ch.replace(/<b>/g,"").replace(/<\/b>/g, "");
			if(arr_enum_c_have.indexOf(tmp) == -1){
				arr_enum_c_have.push(tmp);
			}
		});

		//check if there are any matches in the cde synonyms
		let matched_pv = {};
		if(source.cde_pv !== undefined && source.cde_pv.length > 0){
			source.cde_pv.forEach(function(pv){
				let exist = false;
				let tmp_ss = [];
				if(pv.ss !== undefined && pv.ss.length > 0){
					pv.ss.forEach(function(ss){
						let tmp_s = [];
						let tmp_s_h = [];   
		                //remove duplicate
		                let cache = {};
						ss.s.forEach(function(s){
							let lc = s.trim().toLowerCase();
	                        if(!(lc in cache)){
	                            cache[lc] = [];
	                        }
	                        cache[lc].push(s);
						});
						for(let idx in cache){
	                        //find the term with the first character capitalized
	                        let word = findWord(cache[idx]);
	                        tmp_s.push(word);
	                    }
	                    tmp_s.forEach(function(s){
	                    	if(s in dict_cde_s){
								exist = true;
								tmp_s_h.push(dict_cde_s[s]);
							}
							else{
								tmp_s_h.push(s);
							}
	                    });
						tmp_ss.push({c: ss.c, s: tmp_s_h});
					});
				}
				if(exist){
					//matched_pv[pv.n.toLowerCase()] = tmp_ss;
					matched_pv[pv.n.toLowerCase()] = {"pv":pv.n,"pvm":pv.m,"ss":tmp_ss};
					pv.n = pv.n.replace(/\'/g, '^');
					row.tgts_cde_n += pv.n + "#";
				}
			});
		}
		
		if(source.enum){
			source.enum.forEach(function(em){
				//check if there are any matches in local synonyms
				let exist = false;
				let tmp_s = [];
				if(em.s){
					em.s.forEach(function(s){
						if(s in dict_enum_s){
							exist = true;
							tmp_s.push(dict_enum_s[s])
						}
						else{
							tmp_s.push(s);
						}
					});
				}
				//value to be put into the subtable
				let v = {};
				if(exist){
					//check if there is a match to the value name
					if(em.n in dict_enum_n){
						v.n = dict_enum_n[em.n];
					}
					else{
						v.n = em.n;
					}
					v.ref = row.ref;
					v.n_c = em.n_c;
					v.s = tmp_s;
				}
				else{
					if(em.n in dict_enum_n){
						v.n = dict_enum_n[em.n];
						v.ref = row.ref;
						v.n_c = em.n_c;
						v.s = em.s;
					}
					
				}

				//check if it contains icd-0-3 codes.
				if(em.i_c !== undefined){
					if(arr_enum_c.indexOf(em.i_c.c) >= 0){
						v.i_c = "<b>"+em.i_c.c+"</b>";
						if(v.n == undefined){
							v.n = em.n;
							v.ref = row.ref;
							v.n_c = em.n_c;
							v.s = em.s;
						}
					}
					else{
						let has = false;
						em.i_c.have.forEach(function(ch){
							if(has) return;
							if(arr_enum_c_have.indexOf(ch) >= 0){
								has = true;
							}
						});
						if(has){
							v.i_c = "<b>"+em.i_c.c+"</b>";
							if(v.n == undefined){
								v.n = em.n;
								v.ref = row.ref;
								v.n_c = em.n_c;
								v.s = em.s;
							}
						}
						else{
							v.i_c = em.i_c.c;
						}
					}

				}

				if(v.n !== undefined){
					let tmp = v.n.replace(/<b>/g,"").replace(/<\/b>/g, "");
					row.tgts_enum_n += tmp + "#";
				}
				//check if there are any matched cde_pvs can connect to this value
				// if(v.n !== undefined){
				// 	//v.pv = em.n;

				// 	let lc = em.n.toLowerCase();
				// 	if(lc in matched_pv){
				// 		v.cde_s = matched_pv[lc].ss;
				// 		if(v.cde_s.length){
				// 			v.cde_pv = matched_pv[lc].pv;
				// 			v.cde_pvm = matched_pv[lc].pvm;
				// 		}
				// 		delete matched_pv[lc];

				// 	}
				// 	else{
				// 		v.cde_s = [];
				// 	}

				// 	row.vs.push(v);
				// }
				let lc = em.n.toLowerCase();
				if(lc in matched_pv){
					if(v.n == undefined){
						v.n = em.n;
						v.ref = row.ref;
						v.n_c = em.n_c;
						v.s = em.s;
					}
					
					v.cde_s = matched_pv[lc].ss;
					if(v.cde_s.length){
						v.cde_pv = matched_pv[lc].pv;
						v.cde_pvm = matched_pv[lc].pvm;
					}
					delete matched_pv[lc];

				}
				else{
					v.cde_s = [];
				}

				if(v.n !== undefined){
					row.vs.push(v);
				}
				
			});
		}

		//add the rest of the matched cde_pvs to the subtables
		for(let idx in matched_pv){
			let v = {};
			v.n = "no match";
			v.ref = row.ref;
			v.n_c = "";
			v.s = [];
			v.cde_s = matched_pv[idx].ss;
			if(v.cde_s.length){
				v.cde_pv = matched_pv[idx].pv;
				v.cde_pvm = matched_pv[idx].pvm;
			}
			row.vs.push(v);
		}

		values.push(row);
	});
	let html = "";
	if(values.length == 0){
 		let keyword = $("#keywords").val();
 		html = '<div class="info">No result found for keyword: '+keyword+'</div>';
 	}
 	else{
 		let offset = $('#root').offset().top;
 		let h = window.innerHeight - offset - 110;
 		h = (h < 550) ? 550 : h;
 		html = $.templates(__WEBPACK_IMPORTED_MODULE_0__view__["a" /* default */]).render({mh:h, values:values});
 	}
    let result = {};
    result.len = values.length;
    result.html = html;
    return result;

  }
};

/* harmony default export */ __webpack_exports__["a"] = (func);

/***/ }),
/* 9 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";

let tmpl = '<div class="container table-container"><div class="table-thead row">'
  +'<div class="col-xs-3">'
    +'<div class="table-th">Category / Node / Property</div>'
  +'</div>'
  +'<div class="col-xs-9">'
    +'<div class="row table-thead">'
      +'<div class="table-th col-xs-6">Matched GDC Values</div>'
      +'<div class="table-th col-xs-6">CDE Permissible Values</div>'
    +'</div>'
  +'</div>'
+'</div>'
+'<div id="table-body" class="row table-body" style="max-height: {{:mh}}px;"><div class="col-xs-12">{{for values}}'
+'<div class="table-row row row-flex">'
  +'<div class="property table-td col-xs-3">'
      +'{{:category}}<ul><li class="word-break">{{:node}}<ul><li class="word-break">{{:name}}</li></ul></li></ul>'
      +'<a href="javascript:void(0)" class="gdc-details"><i class="fa fa-angle-down"></i> detail</a>'
      +'<div id="gdc-links" style="display: none;">'
        +'{{if local}}'
          +'<a href="javascript:getGDCData(\'{{:ref}}\',null);">See All Values</a></br>'
          +'<a href="javascript:toCompare(\'{{:ref}}\');"> Compare with User List</a></br>'
        +'{{/if}}'
        +'{{if syn}}'
          +'<a href="javascript:getGDCSynonyms(\'{{:ref}}\', \'{{:tgts_enum_n}}\');">See All Synonyms</a></br>'
        +'{{/if}}'
        +'{{if cdeId == ""}}'
          +''
        +'{{else}}'
          +'caDSR: <a class="table-td-link" href="{{:cdeUrl}}" target="_blank">CDE</a>'
          +'{{if local && cdeLen}}'
            +' , <a class="table-td-link" href="javascript:getCDEData(\'{{:cdeId}}\', \'{{:tgts_cde_n}}\');">Values</a> , <a class="table-td-link" href="javascript:compareGDC(\'{{:ref}}\',\'{{:cdeId}}\');"> Compare with GDC</a>'
          +'{{else cdeLen}}'
            +' , <a class="table-td-link" href="javascript:getCDEData(\'{{:cdeId}}\', \'{{:tgts_cde_n}}\');">Values</a>'
          +'{{else}}'
            +''
          +'{{/if}}'
        +'{{/if}}'
      +'</div>'
  +'</div>'
  +'<div class="col-xs-9 border-l"> {{for vs}}'
    +'<div class="row {{if #getIndex() > 4}}row-toggle row-flex{{else}}row-flex{{/if}}">'
      +'<div class="table-td col-xs-5 border-r border-b">{{if n == "no match"}}no match{{else}}<a href="javascript:getGDCData(\'{{:ref}}\',\'{{:n}}\');">{{if i_c !== undefined }}({{:i_c}}) {{else}}{{/if}}{{:n}}</a>{{/if}}</div>'
      +'<div class="table-td col-xs-7 border-b">'
        +'{{if cde_s.length }}'
        +'<div class="row">'
          +'<div class="col-xs-9">{{:cde_pv}}</div>'
          +'<div class="col-xs-3 cde-links">'
            +'<a href="javascript:void(0);" class="cde-collapser"><i class="fa fa-plus"></i></a>'
            +'{{if n == "no match"}}<a href="javascript:void(0);" class="cde-suggest" style="float: right;">Suggest Item</a>{{/if}}'
          +'</div>'
        +'</div>'
        +'<div id="cde-content" class="table-td" style="display: none;">'
          +'<div class="row">'
            +'<div class="table-td col-xs-12">PV Meaning: {{:cde_pvm}}</div>'
          +'</div>' 
          +'{{for cde_s}}'
          +'<div class="row">'
            +'<div class="col-xs-3">{{:c}}</div>'
            +'<div class="col-xs-9">{{for s}}{{:}}</br>{{/for}}</div>'
          +'</div>'
          +'{{/for}}'
        +'</div>'
        +'{{/if}}'
      +'</div>'
    +'</div> {{/for}}' 
      +'{{if vs.length > 5}}'
        +'<div class="row row-flex"><div class="table-td col-xs-12 border-r">'
         +'<a class="table-td-link show-more-less" href="javascript:void(0);"><i class="fa fa-angle-down"></i> Show More ({{:vs.length - 5}})</a>'
        +'</div></div>'
      +'{{/if}}'
  +'</div>'

+'</div> {{/for}} </div></div></div>'

+'<div id="alert-suggest" class="alert alert-suggest alert-info alert-dismissible" role="alert" style="display: none;">'
  +'An email will be sucessfully sent to <strong>GDC</strong> and <strong>EVS</strong> team.'
+'</div>';


/* harmony default export */ __webpack_exports__["a"] = (tmpl);



/***/ }),
/* 10 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__view__ = __webpack_require__(11);


/* harmony default export */ __webpack_exports__["a"] = (function (trsHtml, psHtml, vsHtml) {

  let html = $.templates(__WEBPACK_IMPORTED_MODULE_0__view__["a" /* default */]).render({trs_active:trsHtml.active, trsHtml: trsHtml.html, ps_active:psHtml.active,ps_len: psHtml.len, psHtml: psHtml.html, vs_active:vsHtml.active, vs_len: vsHtml.len, vsHtml: vsHtml.html});

  return html;
});


/***/ }),
/* 11 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
let tmpl = '<div><ul class="nav nav-tabs" role="tablist">' +
      '<li role="presentation" class="{{if trs_active}}active{{else}}{{/if}}"><a href="#trsTab" aria-controls="trsTab" role="tab" data-toggle="tab">Search Results - GDC Dictionary</a></li>' +
      '<li role="presentation" class="{{if ps_active}}active{{else}}{{/if}}"><a href="#psTab" aria-controls="psTab" role="tab" data-toggle="tab">Properties ({{:ps_len}})</a></li>' +
      '<li role="presentation" class="{{if vs_active}}active{{else}}{{/if}}"><a href="#vsTab" aria-controls="vsTab" role="tab" data-toggle="tab">Values ({{:vs_len}})</a></li></ul>' +
      '<div class="tab-content"><div role="tabpanel" class="tab-pane {{if trs_active}}active{{else}}{{/if}}" id="trsTab">{{:trsHtml}}</div>' +
      '<div role="tabpanel" class="tab-pane {{if ps_active}}active{{else}}{{/if}}" id="psTab">{{:psHtml}}</div>' +
      '<div role="tabpanel" class="tab-pane {{if vs_active}}active{{else}}{{/if}}" id="vsTab">{{:vsHtml}}</div></div></div>';

/* harmony default export */ __webpack_exports__["a"] = (tmpl);

/***/ }),
/* 12 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";

let tmpl = '{{for options}}<div>'
			+'<span style="width:96%;float:left;">{{:id}}</span>'
			+'<label>{{:type}}</label>'
			+'</div>{{/for}}';

/* harmony default export */ __webpack_exports__["a"] = (tmpl);


/***/ }),
/* 13 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__view__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__api__ = __webpack_require__(0);



const func = {
  getGDCData(prop, item) {
 	__WEBPACK_IMPORTED_MODULE_1__api__["a" /* default */].getGDCDataById(prop, function(id, items) {
 		if($('#gdc_data').length){
            $('#gdc_data').remove();
        }
        let target = item == undefined ? item : item.replace(/<b>/g,"").replace(/<\/b>/g, "");
        let html = $.templates(__WEBPACK_IMPORTED_MODULE_0__view__["a" /* default */].gdc_data).render({target:target,items: items });
        let tp = window.innerHeight * 0.2;
        //display result in a table
        $(document.body).append(html);
        if(target !== undefined){
            $('#show_all_gdc_data').bind('click', function(){
                let v = $(this).prop("checked");
                if(v){
                    $('#gdc-data-list div[style="display: none;"]').each(function(){
                        $(this).css("display","block");
                    });
                }
                else{
                    $('#gdc-data-list div[style="display: block;"]').each(function(){
                        $(this).css("display","none");
                    });
                }
            });
        }
        $("#gdc_data").dialog({
                modal: false,
                position: { my: "center top+"+tp, at: "center top", of:window},
                width:"35%",
                title: "GDC Permissible Values ("+items.length+")",
                open: function() {

                },
                close: function() {
                    $(this).remove();
                }
        });
      	
    });
    
  },
  getGDCSynonyms(uid, tgts){
  	__WEBPACK_IMPORTED_MODULE_1__api__["a" /* default */].getGDCDataById(uid, function(id, items) {
 		if($('#gdc_syn_data').length){
            $('#gdc_syn_data').remove();
        }
        let targets = null;
        let icdo = false;
        if(tgts !== null && tgts !== undefined){
            targets = tgts.split("#"); 

            items.forEach(function(item){
                if(item.i_c !== undefined){
                    icdo = true;
                }
                if (targets.indexOf(item.n) > -1){
                    item.e = true;
                }
            });
        }
        else{
            items.forEach(function(item){
                if(item.i_c !== undefined){
                    icdo = true;
                }
            });
        }
        items.forEach(function(it){
            let cache = {};
            let tmp_s = [];
            it.s.forEach(function(s){
                let lc = s.trim().toLowerCase();
                if(!(lc in cache)){
                    cache[lc] = [];
                }
                cache[lc].push(s);
            });
            for(let idx in cache){
                //find the term with the first character capitalized
                let word = findWord(cache[idx]);
                tmp_s.push(word);
            }
            it.s_r = tmp_s;
        }); 
        let html = $.templates(__WEBPACK_IMPORTED_MODULE_0__view__["a" /* default */].gdc_synonyms).render({targets: targets, icdo: icdo, items: items });
        let tp = window.innerHeight * 0.2;
        //display result in a table
        $(document.body).append(html);

        if(tgts !== null && tgts !== undefined && tgts !== ""){
            $('#show_all_gdc_syn').bind('click', function(){
                let v = $(this).prop("checked");
                if(v){
                    $('#gdc-syn-data-list div.table-row[style="display: none;"]').each(function(){
                        $(this).css("display","block");
                    });
                }
                else{
                    $('#gdc-syn-data-list div.table-row[style="display: block;"]').each(function(){
                        $(this).css("display","none");
                    });
                }
            });
        }


        $("#gdc_syn_data").dialog({
                modal: false,
                position: { my: "center top+"+tp, at: "center top", of:window},
                width:"55%",
                title: "GDC Synonyms ("+items.length+")",
                open: function() {
                    $('#gdc-data-invariant').bind('click', function(){
                            $("#gdc-syn-data-list").find('div[name="syn_area"]').each(function(){
                                let rp = $(this).html();
                                let invariant = $(this).parent().children('div[name="syn_invariant"]');
                                $(this).html(invariant[0].innerHTML);
                                invariant[0].innerHTML = rp;
                            });
                        });
                },
                close: function() {
                    $(this).remove();
                }
        });
      	
    });
  },
  toCompare(uid){
  	__WEBPACK_IMPORTED_MODULE_1__api__["a" /* default */].getGDCDataById(uid, function(id, items) {
 		if($('#compare_dialog').length){
            $('#compare_dialog').remove();
        }
        let html = $.templates(__WEBPACK_IMPORTED_MODULE_0__view__["a" /* default */].toCompare).render({items: items });
        let tp = window.innerHeight * 0.2;
        //display result in a table
        $(document.body).append(html);
        $("#compare_dialog").dialog({
            modal: false,
            position: { my: "center top+"+tp, at: "center top", of:window},
            width:"60%",
            title: "Compare Your Values with GDC Permissible Values ",
            open: function() {
            	$('#cp_result').css("display", "none");
                $('#compare').bind('click', function(){
                    let gv = [];
                    items.forEach(function(item){
                    	gv.push(item.n);
                    });
                    compare(gv);
                });
                $('#cancelCompare').bind('click', function(){
                    $("#compare_dialog").dialog('close');
                });
            },
            close: function() {
                $(this).remove();
            }
        });
      	
    });
  },
  getCDEData(uid, tgts){

        __WEBPACK_IMPORTED_MODULE_1__api__["a" /* default */].getCDEDataById(uid, function(id, items) {
            //data precessing
            let tmp = [];
            items.forEach(function(item){
                let t = {};
                t.pv = item.n;
                t.pvm = item.m;
                t.pvd = item.d;
                t.i_rows = [];
                t.rows = [];
                item.ss.forEach(function(s){
                    let i_r = {};
                    let r = {};
                    i_r.pvc = s.c;
                    r.pvc = s.c;
                    r.s = s.s;
                    i_r.s = [];
                    //remove duplicate
                    let cache = {};
                    s.s.forEach(function(w){
                        let lc = w.trim().toLowerCase();
                        if(!(lc in cache)){
                            cache[lc] = [];
                        }
                        cache[lc].push(w);
                    });
                    for(let idx in cache){
                        //find the term with the first character capitalized
                        let word = findWord(cache[idx]);
                        i_r.s.push(word);
                    }
                    t.i_rows.push(i_r);
                    t.rows.push(r);
                });
                tmp.push(t);
            });

            let targets = null;
            
            if(tgts !== null && tgts !== undefined && tgts !== ""){
                tgts = tgts.replace(/\^/g,'\'');
                targets = tgts.split("#"); 

                tmp.forEach(function(item){
                if (targets.indexOf(item.pv) > -1){
                    item.e = true;
                }
                });
            }

            if($('#caDSR_data').length){
                $('#caDSR_data').remove();
            }

            let html = $.templates(__WEBPACK_IMPORTED_MODULE_0__view__["a" /* default */].cde_data).render({targets: targets, items: tmp });
            let tp = window.innerHeight * 0.2;
            //display result in a table
            $(document.body).append(html);
            
            if(targets !== undefined){
                $('#show_all_cde_syn').bind('click', function(){
                    let v = $(this).prop("checked");
                    if(v){
                        $('#cde-syn-data-list div.table-row[style="display: none;"]').each(function(){
                            $(this).css("display","block");
                        });
                    }
                    else{
                        $('#cde-syn-data-list div.table-row[style="display: block;"]').each(function(){
                            $(this).css("display","none");
                        });
                    }
                });
            }


            $("#caDSR_data").dialog({
                    modal: false,
                    position: { my: "center top+"+tp, at: "center top", of:window},
                    width:"60%",
                    title: "CaDSR Permissible Values ("+tmp.length+")",
                    open: function() {
                        $('#cde-data-invariant').bind('click', function(){
                            $("#cde-syn-data-list").find('div[name="syn_area"]').each(function(){
                                let rp = $(this).html();
                                let invariant = $(this).parent().children('div[name="syn_invariant"]');
                                $(this).html(invariant[0].innerHTML);
                                invariant[0].innerHTML = rp;
                            });
                        });
                    },
                    close: function() {
                        $(this).remove();
                    }
            });
            
        });
  },
  compareGDC(prop, uid){
    let ids = {};
    ids.local = prop;
    ids.cde = uid;
    __WEBPACK_IMPORTED_MODULE_1__api__["a" /* default */].getGDCandCDEDataById(ids, function(ids, items) {
        if($('#compareGDC_dialog').length){
            $('#compareGDC_dialog').remove();
        }
        let popup = '<div id="compareGDC_dialog">'
                        +'<div id="compareGDC_result"></div>'
                    +'</div>';
        $(document.body).append(popup);
        let tp = window.innerHeight * 0.2;
        let toV = [];
        let fromV = [];
        let opt = {};
        opt.sensitive = false;
        opt.unmatched = false;
        items.to.forEach(function(t){
            toV.push(t.n);
        });
        items.from.forEach(function(f){
            fromV.push(f.n);
        });
        let table = generateCompareGDCResult(fromV, toV, opt);
        let html = '<div class="cp_result_title">Compare Result</div>'
                    +'<div id="cpGDC_result_option">'
                        +'<div class="option-left"><input type="checkbox" id="compareGDC_filter"> Case Sensitive</div><div class="option-right"><input type="checkbox" id="compareGDC_unmatched"> Hide Unmatched Values</div></div><div class="clearfix"></div>'
                    +'<div id="cpGDC_result_table" class="table-container">'+table+'</div>'
                    //+'<div id="cpGDC_result_bottom"><span id="closeCompareGDC" class="btn-submit-large" style="margin-left: calc(50% - 2em - 10px);">Close</span></div>'
                    +'</div>';

        $('#compareGDC_result').html(html);
        
        $("#compareGDC_dialog").dialog({
                modal: false,
                position: { my: "center top+"+tp, at: "center top", of:window},
                width:"50%",
                title: "Compare GDC Values with caDSR Values ",
                open: function() {
                    //display result in a table
                    ///$('#compareGDC_result').html(html);
                    // let height = $('#cpGDC_result_table').height() +1;
                    // if(height >= 30 * 12.8){
                    //     height = 384;
                    // }
                    // $('#cpGDC_result_table div.table-body').height(height+'px');
                    // $('#closeCompareGDC').bind('click', function(){
                    //     $("#compareGDC_dialog").dialog('close');
                    // });
                    $('#compareGDC_filter').bind('click', function(){
                        let options = {};
                        options.sensitive = $("#compareGDC_filter").prop('checked');
                        options.unmatched = $("#compareGDC_unmatched").prop('checked');
                        let table_new = generateCompareGDCResult(fromV, toV, options);
                        $('#cpGDC_result_table').html(table_new);
                        // let h = $('#cpGDC_result_table').height() +1;
                        // if(h >= 30 * 12.8){
                        //     h = 384;
                        // }
                        // $('#cpGDC_result_table div.table-body').height(h+'px');
                    });
                    $('#compareGDC_unmatched').bind('click', function(){
                        let options = {};
                        options.sensitive = $("#compareGDC_filter").prop('checked');
                        options.unmatched = $("#compareGDC_unmatched").prop('checked');
                        let table_new = generateCompareGDCResult(fromV, toV, options);
                        $('#cpGDC_result_table').html(table_new);
                        // let h = $('#cpGDC_result_table').height() +1;
                        // if(h >= 30 * 12.8){
                        //     h = 384;
                        // }
                        // $('#cpGDC_result_table div.table-body').height(h+'px');
                    });
                },
                close: function() {
                    $(this).remove();
                }
        });
    });
  }
};

/* harmony default export */ __webpack_exports__["a"] = (func);

/***/ }),
/* 14 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";

let tmpl = {
  gdc_data: '<div id="gdc_data">'
          +'{{if target !== null }}'
          +'<div class="option-right"><input type="checkbox" id="show_all_gdc_data"> Show all GDC values</div>'
          +'{{else}}'
          +''
          +'{{/if}}'
          +'<div id="gdc-data-list" class="div-list">'
          +'{{if target !== null }}'
            +'{{for items}}'
            +'{{if n == ~root.target }}'
            +'<div>{{:n}}</div>'
            +'{{else}}'
            +'<div style="display: none;">{{:n}}</div>'
            +'{{/if}}'
            +'{{/for}}'
          +'{{else}}'
            +'{{for items}}'
            +'<div>{{:n}}</div>'
            +'{{/for}}'
          +'{{/if}}'
          +'</div>'
          +'</div>',
  gdc_synonyms: '<div id="gdc_syn_data">'
          +'<div class="option-left"><input type="checkbox" id="gdc-data-invariant"> Show Duplicates</div>'
          +'{{if targets !== null }}'
            +'<div class="option-right"><input type="checkbox" id="show_all_gdc_syn"> Show all GDC values</div>'
          +'{{else}}'
            +''
          +'{{/if}}'
          +'<div class="clearfix"></div>'
          +'<div id="gdc-syn-data-list" class="table-container">'
            +'<div class="table-thead row">'
              +'{{if icdo}}<div class="table-th col-xs-2">ICDO_3_1 CODE</div>{{/if}}'
              +'<div class="table-th col-xs-3">ICD-O-3 Term</div>'
              +'<div class="table-th col-xs-2">NCIt</div>'
              +'<div class="table-th col-xs-5">Synonyms</div>'
            +'</div>'
            +'<div class="table-body row" style="max-height: 450px;">'
              +'<div class="col-xs-12">'
                +'{{for items}}'
                  +'{{if e == true || ~root.targets == null}}'
                    +'<div class="table-row row">'
                      +'{{if ~root.icdo}}<div class="table-td col-xs-2">{{:i_c.c}}</div>{{/if}}'
                      +'<div class="table-td col-xs-3">{{:n}}</div>'
                      +'<div class="table-td col-xs-2">{{:n_c}}</div>'
                      +'<div name="syn_area" class="table-td col-xs-5">{{for s_r}}{{>#data}}<br>{{/for}}</div>'
                      +'<div name="syn_invariant" class="table-td col-xs-5" style="display: none;">'
                      +'{{for s}}{{>#data}}<br>{{/for}}'
                      +'</div>'
                    +'</div>'
                  +'{{else}}'
                    +'<div class="table-row row" style="display: none;">'
                      +'{{if ~root.icdo}}<div class="table-td col-xs-2">{{:i_c.c}}</div>{{/if}}'
                      +'<div class="table-td col-xs-3">{{:n}}</div>'
                      +'<div class="table-td col-xs-2">{{:n_c}}</div>'
                      +'<div name="syn_area" class="table-td col-xs-5">{{for s_r}}{{>#data}}<br>{{/for}}</div>'
                      +'<div name="syn_invariant" class="table-td col-xs-5" style="display: none;">'
                      +'{{for s}}{{>#data}}<br>{{/for}}'
                      +'</div>'

                    +'</div>'
                  +'{{/if}}'
                +'{{/for}}'
              +'</div>'
            +'</div>'
          +'</div>'
        +'</div>',
  toCompare: '<div id="compare_dialog">'
                    +'<div id="compare_form">'
                        +'<div id="cp_top">'
                            +'<label class="left_label">User Defined Values:</label>'
                            +'<label class="right_label">GDC Values:</label>'
                            +'<div id="cp_left">'
                            +'<textarea id="cp_input" rows="10" cols="20" placeholder="Input values line by line" autocomplete="off"></textarea></div>'
                            +'<div id="cp_middle"></div>'
                            +'<div id="cp_right">'
                            +'{{for items}}'
                            +'<div>{{:n}}</div>'
                            +'{{/for}}'
                            +'</div>'
                        +'</div>'
                        +'<div id="cp_massage">'
                        +'</div>'
                        +'<div id="cp_bottom">'
                            +'<button id="compare" class="btn btn-default btn-submit-large">Compare</button>'
                            +'<button id="cancelCompare" class="btn btn-default btn-submit-large">Cancel</button>'
                        +'</div>'
                    +'</div>'
                    +'<div id="compare_result"></div>'
                +'</div>',
  cde_data: '<div id="caDSR_data">'
              +'<div class="data-option">'
                +'<div class="option-left"><input type="checkbox" id="cde-data-invariant"> Show Duplicates</div>'
                +'{{if targets !== null }}'
                  +'<div class="option-right"><input type="checkbox" id="show_all_cde_syn"> Show all GDE values</div>'
                +'{{else}}'
                  +''
                +'{{/if}}'
              +'</div>'
              +'<div class="clearfix"></div>'
              +'<div id="cde-syn-data-list" class="table-container">'
                +'<div class="table-thead row">'
                  +'<div class="table-th col-xs-2">PV</div>'
                  +'<div class="table-th col-xs-2">PV Meaning</div>'
                  +'<div class="table-th col-xs-4">Description</div>'
                  +'<div class="table-th col-xs-4">NCIt Code and Synonyms</div>'
                +'</div>'
                +'<div class="table-body row" style="max-height: 450px;">'
                  +'<div class="col-xs-12">'
                  +'{{for items}}'
                    +'{{if e == true || ~root.targets == null}}'
                    +'<div class="table-row row">'
                      +'<div class="table-td col-xs-2">{{:pv}}</div>'
                      +'<div class="table-td col-xs-2">{{:pvm}}</div>'
                      +'<div class="table-td col-xs-4">{{:pvd}}</div>'
                      +'<div name="syn_area" class="table-td col-xs-4">'
                      +'{{for i_rows}}'
                        +'<div class="row">'
                          +'<div class="col-lg-3 col-xs-12"><a class="table-td-link" href="https://ncit.nci.nih.gov/ncitbrowser/pages/concept_details.jsf?dictionary=NCI_Thesaurus&code={{:pvc}}" target="_blank">{{:pvc}}</a></div>'
                          +'<div class="col-lg-9 col-xs-12">{{for s}}{{>#data}}<br>{{/for}}</div>'
                        +'</div>' 
                      +'{{/for}}'
                      +'</div>'
                      +'<div name="syn_invariant" class="table-td col-xs-4" style="display: none;">'
                      +'{{for rows}}'
                        +'<div class="row">'
                          +'<div class="col-lg-3 col-xs-12"><a class="table-td-link" href="https://ncit.nci.nih.gov/ncitbrowser/pages/concept_details.jsf?dictionary=NCI_Thesaurus&code={{:pvc}}" target="_blank">{{:pvc}}</a></div>'
                          +'<div class="col-lg-9 col-xs-12">{{for s}}{{>#data}}<br>{{/for}}</div>'
                        +'</div>' 
                      +'{{/for}}'
                      +'</div>'
                    +'</div>'
                    +'{{else}}'
                    +'<div class="table-row row" style="display: none;">'
                      +'<div class="table-td col-xs-2">{{:pv}}</div>'
                      +'<div class="table-td col-xs-2">{{:pvm}}</div>'
                      +'<div class="table-td col-xs-4">{{:pvd}}</div>'
                      +'<div name="syn_area" class="table-td col-xs-4">'
                      +'{{for i_rows}}'
                        +'<div class="row">'
                          +'<div class="col-lg-3 col-xs-12"><a class="table-td-link" href="https://ncit.nci.nih.gov/ncitbrowser/pages/concept_details.jsf?dictionary=NCI_Thesaurus&code={{:pvc}}" target="_blank">{{:pvc}}</a></div>'
                          +'<div class="col-lg-9 col-xs-12">{{for s}}{{>#data}}<br>{{/for}}</div>'
                        +'</div>' 
                      +'{{/for}}'
                      +'</div>'
                      +'<div name="syn_invariant" class="table-td col-xs-4" style="display: none;">'
                      +'{{for rows}}'
                        +'<div class="row">'
                          +'<div class="col-lg-3 col-xs-12"><a class="table-td-link" href="https://ncit.nci.nih.gov/ncitbrowser/pages/concept_details.jsf?dictionary=NCI_Thesaurus&code={{:pvc}}" target="_blank">{{:pvc}}</a></div>'
                          +'<div class="col-lg-9 col-xs-12">{{for s}}{{>#data}}<br>{{/for}}</div>'
                        +'</div>' 
                      +'{{/for}}'
                      +'</div>'
                    +'</div>'
                    +'{{/if}}'
                  +'{{/for}}'
                  +'</div>'
                +'</div>'
              +'</div>'
            +'</div>'
};

/* harmony default export */ __webpack_exports__["a"] = (tmpl);

/***/ })
/******/ ]);