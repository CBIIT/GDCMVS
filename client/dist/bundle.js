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
        if(source.enum !== undefined){
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
        else if(source.cde_id !== undefined){
        	p.node = "branch";
        	trs.push(p);
        	//show caDSR reference
        	count++;
            let l = {};
            l.id = count + "_l";
            l.l_id = source.cde_id;
            l.l_type = "cde";
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
            l.l_id = source.ncit;
            l.l_type = "ncit";
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

    console.log(h);

    let html = $.templates(__WEBPACK_IMPORTED_MODULE_0__view__["a" /* default */]).render({mh:h,trs: trs});

    return html;

  }
};

/* harmony default export */ __webpack_exports__["a"] = (func);

/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";

let tmpl = '<div class="container table-container">'
			+'<div id="table_results" style="display: block;">'
				+'<span id="collapse" class="btn btn-list">Collapse all</span>'
				+'<span id="expand" class="btn btn-list">Expand all</span>'
				+'<div class="table-row-thead row">' 
					+'<div class="table-th col-xs-4">name</div>' 
					+'<div class="table-th col-xs-8">Description</div>'
				+'</div>'
				+'<div>'
					+'<table class="data-table treetable" id="tree_table" border ="0" cellPadding="0" cellSpacing="0" width="100%" style="display:table; margin: 0px;">'
						+'<tbody style="max-height: {{:mh}}px; overflow-y: auto; width:100%; display:block;">'
						+'{{for trs}}'
						+'<tr key="{{:id}}" data-tt-id="{{:data_tt_id}}" data-tt-parent-id="{{:data_tt_parent_id}}" class="data-table-row {{:node}}" style="width:100%; float:left;">'
						+'<td width="33%" style="width:33%; float:left;">'
						+'<span class="{{:type}}">'
						+'{{if type == "folder"}}'
						+'<a href="https://docs.gdc.cancer.gov/Data_Dictionary/viewer/#?view=table-definition-view&id={{:l_id}}" target="_blank">{{:title}}</a>'
						+'{{else type == "link"}}'
							+'{{if l_type == "cde"}}'
							+'No values in GDC, reference values in <a href="javascript:getCDEData("{{:l_id}}");" class="table-td-link">caDSR</a>'
							+'{{else}}'
							+'No values in GDC, concept referenced in <a target="_blank" href="https://ncit.nci.nih.gov/ncitbrowser/pages/concept_details.jsf?dictionary=NCI_Thesaurus&code={{:l_id}}" class="table-td-link">NCIt</a>'
							+'{{/if}}'
			            +'{{else}}'
			            +'{{:title}}'
			            +'{{/if}}'
			            +'</td>'
			            +'<td width="66%" style="width:66%; float:left;">'
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
 			prop.ref = source.name;
 			prop.cdeId = source.cde_id == undefined ? "" : source.cde_id;
 			props.push(prop);
 		}
 	});
 	let html = "";
 	if(props.length == 0){
 		let keyword = $("#keywords").val();
 		html = '<div class="info">No result found for keyword: '+keyword+'</div>';
 	}
 	else{
 		html = $.templates(__WEBPACK_IMPORTED_MODULE_0__view__["a" /* default */]).render({props: props});
 	}
    
    return html;

  }
};

/* harmony default export */ __webpack_exports__["a"] = (func);

/***/ }),
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";

let tmpl = '<div class="container table-container"><div class="table-row-thead row">' +
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

	let values = [];
	items.forEach(function (item){
	  	let hl = item.highlight;
	  	let source = item._source;
	  	let dict_enum_n = {};
		let dict_enum_s ={};
		let value = {};
		value._id = item._id;
	  	if(("enum.n" in hl || "enum.n.have" in hl || "enum.s" in hl || "enum.s.have" in hl || "cde_pv.ss.s" in hl )){
			let enum_n = ("enum.n" in hl) || ("enum.n.have" in hl) ? hl["enum.n"] || hl["enum.n.have"] : [];
			let enum_s = ("enum.s" in hl) || ("enum.s.have" in hl) ? hl['enum.s'] || hl["enum.s.have"] : [];
			let cde_pv_s = ("cde_pv.ss.s" in hl) ? hl['cde_pv.ss.s'] : 'No Value';
			enum_n.forEach(function(n){
				let tmp = n.replace(/<b>/g,"").replace(/<\/b>/g, "");
				dict_enum_n[tmp] = n;
			});
			enum_s.forEach(function(s){
				let tmp = s.replace(/<b>/g,"").replace(/<\/b>/g, "");
				dict_enum_s[tmp] = s;
			});
		}
		value.vs = [];

		if(source.enum){

			source.enum.forEach(function(em){
				//check if em.n exists in the dict_enum_n
				let vs = {}
				if(em.n in dict_enum_n){

					vs["n"] = dict_enum_n[em.n];
					vs["n_c"] = em.n_c;

					vs["s"] = [];
					em.s.forEach(function(s){
						if(s in dict_enum_s){
							vs["s"].push(dict_enum_s[s])
							//value.vs.push({n:em.n, n_c: em.n_c ,s: em.s});
						}
						else{
							vs["s"].push(s);
						}
					});				
					//check if there are any matches in the synonyms
					value.vs.push(vs);

				}
				else{
					if(em.s){
						let tmp = [];
						let exist = false;
						em.s.forEach(function(s){
							if(s in dict_enum_s){
								exist = true;
								tmp.push(dict_enum_s[s]);
								// value.vs.push({n:em.n, n_c: em.n_c ,s: em.s});
								// break
							}
							else{
								tmp.push(s);
							}
						});
						if(exist){
							value.vs.push({n:em.n, n_c: em.n_c ,s:tmp});
						}					
					}

					
					//ceck synonyms
				}

			});
		}

		// for (var key_enum_n in dict_enum_n) {
		//     // skip loop if the property is from prototype
		//     if (!dict_enum_n.hasOwnProperty(key_enum_n)) continue;
		//     //let nm = [];

		// 	if(source.enum){
		// 		source.enum.forEach(function(e){
		// 			if(e.n == key_enum_n){
		// 				//nm['nm'] = dict_enum_n[key_enum_n];
		// 				value.nm.push({n:dict_enum_n[key_enum_n], n_c: e.n_c ,s: e.s});
		// 			}//else{

		// 			// 	for(var key_enum_s in dict_enum_s)
		// 			// 		e.s.forEach(function(s){
		// 			// 			if(s = key_enum_s){
		// 			// 				nm[''] = e.s
		// 			// 			}
		// 			// 		})
		// 			// }
		// 			// nm['n'] = dict_enum_n[key_enum_n];
		// 			// nm['s'] = [];

		// 			// for(var key_enum_s in dict_enum_s){
		// 			// 	e.s.forEach(function(s){
		// 			// 		if(e.n == key_enum_n){
		// 			// 			nm['n'] = dict_enum_n[key_enum_n];

		// 			// 			if()

		// 			// 			nm['s'].push(e)

		// 			// 		}

		// 			// 	});
		// 			// }
		// 		});
		// 	}
		// }


		// for (var key_enum_s in dict_enum_s) {
		//     // skip loop if the property is from prototype
		//     if (!dict_enum_s.hasOwnProperty(key_enum_s)) continue;

		// 	if(source.enum){
		// 		source.enum.forEach(function(e){
		// 			e.s.forEach(function(s){
		// 				if(s == key_enum_s){
		// 					console.log(s);
		// 				}
		// 			});
					
		// 		});
		// 	}
		// }

		values.push(value);

		
	});
	console.log(values);

    let html = $.templates(__WEBPACK_IMPORTED_MODULE_0__view__["a" /* default */]).render({values: values});

    return html;

  }
};

/* harmony default export */ __webpack_exports__["a"] = (func);

/***/ }),
/* 9 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";

let tmpl = '<div class="container table-container"><div class="table-row-thead row">' +
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
'</div> {{for values}}' +
'<div class="table-row row">' +
  '<div class="table-td col-xs-3">{{:_id}}</div>' +
  '<div class="table-td col-xs-3">{{for vs}}{{:n}}</br>{{/for}}</div>' +
  '<div class="table-td col-xs-3">{{for vs}}{{:n_c}}</br>{{for s}}{{>}}</br>{{/for}}{{/for}}</div>' +
  '<div class="table-td col-xs-3">Content</div>' +
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