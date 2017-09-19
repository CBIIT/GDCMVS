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
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__search_bar___ = __webpack_require__(1);



$("#search").bind("click", __WEBPACK_IMPORTED_MODULE_0__search_bar___["a" /* default */].search);

$("#keywords").bind("keypress", __WEBPACK_IMPORTED_MODULE_0__search_bar___["a" /* default */].gotoSearch);

$("#keywords").bind("keydown", __WEBPACK_IMPORTED_MODULE_0__search_bar___["a" /* default */].selectSuggestion);

$("#keywords").bind("input", __WEBPACK_IMPORTED_MODULE_0__search_bar___["a" /* default */].suggest);

$(document).on('click',__WEBPACK_IMPORTED_MODULE_0__search_bar___["a" /* default */].removeBox);




/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__api__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__render__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__view__ = __webpack_require__(12);




let displayBoxIndex = -1;

const func = {
    search(){
        let keyword = $("#keywords").val();
        keyword = keyword.toLowerCase();
        let option = {};
        option.desc = $("#i_desc").prop('checked');
        option.syn = $("#i_syn").prop('checked');
        option.match = $("input[name=i_match]:checked").val();
        $("#suggestBox").css("display","none");
        displayBoxIndex = -1;
        __WEBPACK_IMPORTED_MODULE_0__api__["a" /* default */].searchAll(keyword, option, function(keyword, option, items) {
          //console.log(items);
          Object(__WEBPACK_IMPORTED_MODULE_1__render__["a" /* default */])(keyword, option, items);
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
/* 2 */
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
        //preprocess the data
        let items = result;
        callback(keyword, option, items);
      });
  }
}

/* harmony default export */ __webpack_exports__["a"] = (api);


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
	let psHtml = __WEBPACK_IMPORTED_MODULE_1__props_table___["a" /* default */].render(items);
	let vsHtml = __WEBPACK_IMPORTED_MODULE_2__values_table___["a" /* default */].render(items);
	html = Object(__WEBPACK_IMPORTED_MODULE_3__tabs___["a" /* default */])(trsHtml, psHtml, vsHtml);
  }
  else{
  	html = '<div class="info">No result found for keyword: '+keyword+'</div>';
  }
  
  $("#root").html(html);
}


/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__view__ = __webpack_require__(5);


const func = {
  render(items) {
 	//data preprocessing
    let html = $.templates(__WEBPACK_IMPORTED_MODULE_0__view__["a" /* default */]).render();

    return html;

  }
};

/* harmony default export */ __webpack_exports__["a"] = (func);

/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";

let tmpl = '<div class="container"><div class="table-row-thead row">' +
  '<div class="table-th col-xs-6">Name</div>' +
  '<div class="table-th col-xs-6">Description</div>' +
'</div>' +
'<div class="table-row row">' +
  '<div class="table-td col-xs-4">Content</div>' +
  '<div class="table-td col-xs-4">Content</div>' +
  '<div class="table-td col-xs-4">Content</div>' +
'</div></div>';

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
 		if(("name" in hl) || ("desc") in hl){
 			let prop = {};
 			prop.nm = ("name" in hl) ? hl["name"] : source.name;
 			prop.nd = source.node;
 			prop.ct = source.category;
 			prop.desc = ("desc" in hl) ? hl["desc"] : source.desc;
 			prop.ref = source.name;
 			prop.cdeId = source.cde_id == undefined ? "" : source.cde_id;
 			props.push(prop);
 		}
 	});
    let html = $.templates(__WEBPACK_IMPORTED_MODULE_0__view__["a" /* default */]).render({props: props});

    return html;

  }
};

/* harmony default export */ __webpack_exports__["a"] = (func);

/***/ }),
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";

let tmpl = '<div class="container"><div class="table-row-thead row">' +
  '<div class="table-th col-xs-1">Category / Node</div>' +
  '<div class="table-th col-xs-2">Property</div>' +
  '<div class="table-th col-xs-3">Description</div>' +
  '<div class="table-th col-xs-3">GDC Property Values</div>' +
  '<div class="table-th col-xs-3">CDE Reference</div>' +
'</div>' +
'{{for props}}'+
'<div class="table-row row">' +
  '<div class="table-td col-xs-1">{{:ct}} -- {{:nd}}</div>' +
  '<div class="table-td col-xs-2">{{:nm}}</div>' +
  '<div class="table-td col-xs-3">{{:desc}}</div>' +
  '<div class="table-td col-xs-3">{{:ref}}</div>' +
  '<div class="table-td col-xs-3">{{:cdeId}}</div>' +
'</div>'+
'{{/for}}</div>';

/* harmony default export */ __webpack_exports__["a"] = (tmpl);

/***/ }),
/* 8 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__view__ = __webpack_require__(9);


const func = {
  render(items) {
 	//data preprocessing
    let html = $.templates(__WEBPACK_IMPORTED_MODULE_0__view__["a" /* default */]).render({items: items });

    return html;

  }
};

/* harmony default export */ __webpack_exports__["a"] = (func);

/***/ }),
/* 9 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";

let tmpl = '<div class="container"><div class="table-row-thead row">' +
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
  '<div class="table-td col-xs-4">{{:_id}}</div>' +
  '<div class="table-td col-xs-4">Content</div>' +
  '<div class="table-td col-xs-4">Content</div>' +
'</div> {{/for}} </div>';

/* harmony default export */ __webpack_exports__["a"] = (tmpl);



/***/ }),
/* 10 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__view__ = __webpack_require__(11);


/* harmony default export */ __webpack_exports__["a"] = (function (trsHtml, psHtml, vsHtml) {

  let html = $.templates(__WEBPACK_IMPORTED_MODULE_0__view__["a" /* default */]).render({trsHtml: trsHtml, psHtml: psHtml, vsHtml: vsHtml});

  return html;
});


/***/ }),
/* 11 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
let tmpl = '<div><ul class="nav nav-tabs" role="tablist">' +
      '<li role="presentation" class="active"><a href="#trsTab" aria-controls="trsTab" role="tab" data-toggle="tab">Search Results</a></li>' +
      '<li role="presentation"><a href="#psTab" aria-controls="psTab" role="tab" data-toggle="tab">Properties</a></li>' +
      '<li role="presentation"><a href="#vsTab" aria-controls="vsTab" role="tab" data-toggle="tab">Values</a></li></ul>' +
      '<div class="tab-content"><div role="tabpanel" class="tab-pane active" id="trsTab">{{:trsHtml}}</div>' +
      '<div role="tabpanel" class="tab-pane" id="psTab">{{:psHtml}}</div>' +
      '<div role="tabpanel" class="tab-pane" id="vsTab">{{:vsHtml}}</div></div></div>';

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


/***/ })
/******/ ]);