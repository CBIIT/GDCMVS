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
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__search_bar_view__ = __webpack_require__(1);




/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__index__ = __webpack_require__(2);


$("#searchProperty").bind("click", __WEBPACK_IMPORTED_MODULE_0__index__["a" /* default */]);


/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = search;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__api__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__render__ = __webpack_require__(4);



function search(){
    let keyword = $("#keywords").val();
    keyword = keyword.toLowerCase();
    let option = {};
    option.desc = $("#i_desc").prop('checked');
    option.syn = $("#i_syn").prop('checked');
    option.match = $("input[name=i_match]:checked").val();
    $("#suggestBox").css("display","none");
    //displayBoxIndex = -1;
    __WEBPACK_IMPORTED_MODULE_0__api__["a" /* default */].searchAll(keyword, option, function(keyword, option, items) {
      //console.log(items);
      Object(__WEBPACK_IMPORTED_MODULE_1__render__["a" /* default */])(keyword, option, items);
    });
}


/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
const baseUrl = 'http://ec2-54-152-84-22.compute-1.amazonaws.com/gdc/search/';

const api = {
  suggest(value, callback) {
    $.getJSON({
  	url: "http://ec2-54-152-84-22.compute-1.amazonaws.com/gdc/search/suggest?keyword=" + value,
  	success: function(data) {
  		//console.log(data);
  	  callback(data);
  	}
    });
  },
  searchAll(keyword, option, callback) {
    $.getJSON(baseUrl + 'all', {keyword:keyword, option: JSON.stringify(option)}, function(result){
        let items = [];
        if(result.length !== 0){
            result.forEach(function(hit){
                let it = {};
                it.doc = hit._source;
                it.highlight = hit.highlight;
                items.push(it);
            });
        }
        callback(keyword, option, items);
      });
  }
}

/* harmony default export */ __webpack_exports__["a"] = (api);


/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = render;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__values_table_view__ = __webpack_require__(5);


function render(keyword, option, items){
  let html = Object(__WEBPACK_IMPORTED_MODULE_0__values_table_view__["a" /* default */])(items);
  $("#root").html(html);
}


/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = vsRender;
function vsRender(items) {
  console.log(items);

let tmpl = '<div class="table-row-thead row">' +
  '<div class="col-xs-3">' +
    '<div class="table-th">Category / Node / Property</div>' +
  '</div>' +
  '<div class="col-xs-9">' +
    '<div class="row">' +
      '<div class="table-th col-xs-6">GDC Values and Synonyms</div>' +
      '<div class="table-th col-xs-6">CDE references, permissible values and Synonyms</div>' +
    '</div>' +
    '<div class="row">' +
      '<div class="table-th col-xs-3">Matched GDC Value</div>' +
      '<div class="table-th col-xs-3">GDC Synonyms</div>' +
      '<div class="table-th col-xs-3">NCIt Code and Synonyms</div>' +
      '<div class="table-th col-xs-3">CDE Reference</div>' +
    '</div>' +
  '</div>' +
'</div> {{for items}}' +
'<div class="table-row row">' +
  '<div class="table-td col-xs-4">{{:doc.id}}</div>' +
  '<div class="table-td col-xs-4">Content</div>' +
  '<div class="table-td col-xs-4">Content</div>' +
'</div> {{/for}}';

let html = $.templates(tmpl).render({items: items });

return html;

}


/***/ })
/******/ ]);