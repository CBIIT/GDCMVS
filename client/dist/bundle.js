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

function getGDCData(prop, target){
	let uid = prop.replace(/@/g, '/');
	__WEBPACK_IMPORTED_MODULE_1__dialog___["a" /* default */].getGDCData(uid, target);
}

window.getGDCData = getGDCData;

function getGDCSynonyms(prop){
	let uid = prop.replace(/@/g, '/');
	__WEBPACK_IMPORTED_MODULE_1__dialog___["a" /* default */].getGDCSynonyms(uid);
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
                    +'<div id="cp_result_table">'+table+'</div>'
                    +'<div id="cp_result_bottom"><span id="back2Compare" class="btn-submit-large">Back</span></div>'
                    +'</div>';
        $('#compare_result').html(html);

        let h = $('#cp_result_table table:first-child').height() +1;
        if(h >= 30 * 12.8){
            h = 384;
        }
        $('#cp_result_table').height(h+'px');
        $('#compare_filter').bind('click', function(){
            let options = {};
            options.sensitive = $("#compare_filter").prop('checked');
            options.unmatched = $("#compare_unmatched").prop('checked');
            let table_new = generateCompareResult(vs, gv, options);
            $('#cp_result_table').html(table_new);
            let h = $('#cp_result_table table:first-child').height() +1;
            if(h >= 30 * 12.8){
                h = 384;
            }
            $('#cp_result_table').height(h+'px');
        });
        $('#compare_unmatched').bind('click', function(){
            let options = {};
            options.sensitive = $("#compare_filter").prop('checked');
            options.unmatched = $("#compare_unmatched").prop('checked');
            let table_new = generateCompareResult(vs, gv, options);
            $('#cp_result_table').html(table_new);
            let h = $('#cp_result_table table:first-child').height() +1;
            if(h >= 30 * 12.8){
                h = 384;
            }
            $('#cp_result_table').height(h+'px');
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

    let table = '<table width="100%"><tbody><tr class="data-table-head center"><td width="50%" style="text-align:left;">User Defined Values</td><td width="50%" style="text-align:left;">Matched GDC Values</td></tr>';

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
            table += '<tr class="data-table-row"><td align="left">'+v+'</td><td align="left">'+text+'</td></tr>';
        }
        else{
            table += '<tr class="data-table-row"><td align="left">'+v+'</td><td align="left"><b>'+(idx+1)+'.</b>'+text+'</td></tr>';
        }
    });
    for(var i = 0; i< toV.length; i++){
        if(v_matched.indexOf(i) >= 0){
            continue;
        }
        table += '<tr class="data-table-row '+(option.unmatched ? 'row-undisplay' : '')+'"><td align="left"><div style="color:red;">--</div></td><td align="left"><b>'+(i+1)+'.</b>'+toV[i]+'</td></tr>';
    }
    table += "</tbody></table>";
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

    let table = '<table width="100%"><tbody><tr class="data-table-head center"><td width="50%" style="text-align:left;">GDC Values</td><td width="50%" style="text-align:left;">Matched caDSR Values</td></tr>';

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
            table += '<tr class="data-table-row"><td align="left"><b>'+(++from_num)+'.</b>'+v+'</td><td align="left">'+text+'</td></tr>';
        }
        else{
            table += '<tr class="data-table-row"><td align="left"><b>'+(++from_num)+'.</b>'+v+'</td><td align="left"><b>'+(idx+1)+'.</b>'+text+'</td></tr>';
        }
    });
    for(var i = 0; i< toV.length; i++){
        if(v_matched.indexOf(i) >= 0){
            continue;
        }
        table += '<tr class="data-table-row '+(option.unmatched ? 'row-undisplay' : '')+'"><td align="left"><div style="color:red;">--</div></td><td align="left"><b>'+(i+1)+'.</b>'+toV[i]+'</td></tr>';
    }
    table += "</tbody></table>";

    return table;
};

window.generateCompareGDCResult = generateCompareGDCResult;

function getCDEData(cdeId){
    __WEBPACK_IMPORTED_MODULE_1__dialog___["a" /* default */].getCDEData(cdeId);
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
    words.forEach(function(w){
        if(word !== ""){
            return;
        }
        if(/^[A-Z]/.test(w)){
            word = w;
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

  $(".show-more-less").click(function () {
    let target = $(this);

    let parentTable = $(this).parent().parent();
    let targets = parentTable.find('.row-toggle');
    if(target.text() == "Show Less"){
      targets.css({display: 'none'});
      target.text('Show More');
    } else {
      targets.css({display: 'flex'});
      target.text('Show Less');
    }
  });
  
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
				+'</div>'
				+'<div class="table-row-thead row">' 
					+'<div class="col-xs-4"><div class="table-th">Name</div></div>' 
					+'<div class="col-xs-8"><div class="table-th">Description</div></div>'
				+'</div>'
				+'<div class="row">'
					+'<table class="data-table treetable" id="tree_table" border ="0" cellPadding="0" cellSpacing="0" width="100%" style="display:table; margin: 0px;">'
						+'<tbody style="max-height: {{:mh}}px; overflow-y: auto; width:100%; display:block;">'
						+'{{for trs}}'
						+'<tr key="{{:id}}" data-tt-id="{{:data_tt_id}}" data-tt-parent-id="{{:data_tt_parent_id}}" class="data-table-row {{:node}}" style="width:100%; float:left;">'
						+'<td width="33%" style="width:33%; float:left;">'
						+'<span class="{{:type}}" style="display:inline-block; width: 275px;">'
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
 			prop.cdeId = source.cde_id !== undefined ? source.cde_id : "";
 			prop.cdeLen = source.cde_pv == undefined || source.cde_pv.length == 0 ? false : true;
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

let tmpl = '<div class="container table-container"><div class="table-row-thead row">' +
  '<div class="table-th col-xs-2">Category / Node</div>' +
  '<div class="table-th col-xs-2">Property</div>' +
  '<div class="table-th col-xs-5">Description</div>' +
  '<div class="table-th col-xs-2">GDC Property Values</div>' +
  '<div class="table-th col-xs-1">CDE Reference</div>' +
'</div>' +
'<div class="row table-body" style="max-height: {{:mh}}px;"><div class="col-xs-12">'+
'{{for props}}'+
'<div class="table-row row">' +
  '<div class="table-td col-xs-2">{{:ct}}<ul><li>{{:nd}}</li></ul></div>' +
  '<div class="table-td col-xs-2">{{:nm}}</div>' +
  '<div class="table-td col-xs-5">{{:desc}}</div>' +
  '<div class="table-td col-xs-2">'
  +'{{if local}}'
  +'<a href="javascript:getGDCData(\'{{:ref}}\',null);">See All Values</a>'
  +'<br><a href="javascript:toCompare(\'{{:ref}}\');"> Compare with User List</a>'
    +'{{if syn}}'
    +'<br><a href="javascript:getGDCSynonyms(\'{{:ref}}\');">See All Synonyms</a>'
    +'{{else}}'
    +'{{/if}}'
  +'{{else}}'
  +'no values'
  +'{{/if}}'
  +'</div>' 
  +'<div class="table-td col-xs-1">'
  +'{{if cdeId == ""}}'
  +''
  +'{{else}}'
  +'caDSR: <a class="table-td-link" href="https://cdebrowser.nci.nih.gov/cdebrowserClient/cdeBrowser.html#/search?publicId={{:cdeId}}&version=1.0" target="_blank">CDE</a>'
    +'{{if local && cdeLen}}'
    +'<br><a class="table-td-link" href="javascript:getCDEData(\'{{:cdeId}}\');">Values</a> , <a class="table-td-link" href="javascript:compareGDC(\'{{:ref}}\',\'{{:cdeId}}\');"> Compare with GDC</a>'
    +'{{else cdeLen}}'
    +' , <a class="table-td-link" href="javascript:getCDEData(\'{{:cdeId}}\');">Values</a>'
    +'{{else}}'
    +''
    +'{{/if}}'
  +'{{/if}}'
  +'</div>' +
'</div>'+
'{{/for}}</div></div></div>';

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
	  		&& hl["cde_pv.ss.s"] == undefined && hl["cde_pv.ss.s.have"] == undefined){
	  		return;
		}
	  	let source = item._source;
	  	let dict_enum_n = {};
		let dict_enum_s = {};
		let dict_cde_s = {};
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
		row.cdeId = source.cde_id !== undefined ? source.cde_id : "";
		row.cdeLen = source.cde_pv == undefined || source.cde_pv.length == 0 ? false : true;
		//value informations in the subtable
		row.vs = [];
	  	let enum_n = ("enum.n" in hl) || ("enum.n.have" in hl) ? hl["enum.n"] || hl["enum.n.have"] : [];
		let enum_s = ("enum.s" in hl) || ("enum.s.have" in hl) ? hl['enum.s'] || hl["enum.s.have"] : [];
		let cde_s = ("cde_pv.ss.s" in hl) || ("cde_pv.ss.s.have" in hl) ? hl["cde_pv.ss.s"] || hl["cde_pv.ss.s.have"] : [];
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

		//check if there are any matches in the cde synonyms
		let matched_pv = {};
		if(source.cde_pv !== undefined && source.cde_pv.length > 0){
			source.cde_pv.forEach(function(pv){
				let exist = false;
				let tmp_ss = [];
				if(pv.ss !== undefined && pv.ss.length > 0){
					pv.ss.forEach(function(ss){
						let tmp_s = []
						ss.s.forEach(function(s){
							if(s in dict_cde_s){
								exist = true;
								tmp_s.push(dict_cde_s[s])
							}
							else{
								tmp_s.push(s);
							}
						});
						tmp_ss.push({c: ss.c, s: tmp_s});
					});
				}
				if(exist){
					matched_pv[pv.n.toLowerCase()] = tmp_ss;
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
					//check if there is a match with the value name
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
				//check if there are any matched cde_pvs can connect to this value
				if(v.n !== undefined){
					let lc = em.n.toLowerCase();
					if(lc in matched_pv){
						v.cde_s = matched_pv[lc];
						delete matched_pv[lc];
					}
					else{
						v.cde_s = [];
					}
					row.vs.push(v);
				}
				
			});
		}

		//add the rest of the matched cde_pvs to the subtables
		for(let idx in matched_pv){
			let v = {};
			v.n = "See All Values";
			v.ref = row.ref;
			v.n_c = "";
			v.s = [];
			v.cde_s = matched_pv[idx];
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

let tmpl = '<div class="container table-container"><div class="table-row-thead row">' +
  '<div class="w20">' +
    '<div class="table-th">Category / Node / Property</div>' +
  '</div>' +
  '<div class="w80">' +
    '<div class="">' +
      '<div class="table-th table-header col-xs-6">GDC Values and Synonyms</div>' +
      '<div class="table-th table-header col-xs-6">CDE references, permissible values and Synonyms</div>' +
    '</div>' +
    '<div class="">' +
      '<div class="table-th col-xs-3">Matched GDC Value</div>' +
      '<div class="table-th col-xs-3">GDC Synonyms</div>' +
      '<div class="table-th col-xs-3">NCIt Code and Synonyms</div>' +
      '<div class="table-th col-xs-3">CDE Reference</div>' +
    '</div>' +
  '</div>' +
'</div>'+
'<div class="row table-body" style="max-height: {{:mh}}px;"><div class="col-xs-12">{{for values}}' +
'<div class="table-row row">' +
  '<div class="w20 table-td">'+
      '{{:category}}<ul><li>{{:node}}<ul><li>{{:name}}</li></ul></li></ul>'+
  '</div>'+
  '<div class="w60 border-l border-r"> {{for vs}}' +
    '<div class="{{if #getIndex() > 4}}row-toggle row-flex{{else}}row-flex{{/if}}" style="">' +
      '<div class="table-td col-xs-4 border-r border-b">{{if n == "See All Values"}}<a href="javascript:getGDCData(\'{{:ref}}\',null);">See All Values</a>{{else}}<a href="javascript:getGDCData(\'{{:ref}}\',\'{{:n}}\');">{{:n}}</a>{{/if}}</div>' +
      '<div class="table-td col-xs-4 border-r border-b"><div class="row"><div class="col-xs-3">{{:n_c}}</div><div class="col-xs-9">{{for s}}{{:}}</br>{{/for}}</div></div></div>' +
      '<div class="table-td col-xs-4 border-b">'
        +'{{for cde_s}}'
        +'<div class="row">'
          +'<div class="col-xs-3">{{:c}}</div>'
          +'<div class="col-xs-9">{{for s}}{{:}}</br>{{/for}}</div>'
        +'</div>' 
        +'{{/for}}'
      +'</div>'
    +'</div> {{/for}}' 
    +'<div class="show-more">{{if vs.length > 5}}<a class="table-td-link show-more-less" href="javascript:void(0);">Show More</a>{{else}}{{/if}}</div>'
    +'<div class="links">'
      +'{{if local}}'
      +'<a href="javascript:toCompare(\'{{:ref}}\');"> Compare with User List</a>'
        +'{{if syn}}'
        +' , <a href="javascript:getGDCSynonyms(\'{{:ref}}\');">See All Synonyms</a>'
        +'{{else}}'
        +'{{/if}}'
      +'{{else}}'
      +''
      +'{{/if}}'
    +'</div>' +
  '</div>' +
  '<div class="table-td w20">'
  +'{{if cdeId == ""}}'
  +''
  +'{{else}}'
  +'caDSR: <a class="table-td-link" href="https://cdebrowser.nci.nih.gov/cdebrowserClient/cdeBrowser.html#/search?publicId={{:cdeId}}&version=1.0" target="_blank">CDE</a>'
    +'{{if local && cdeLen}}'
    +'<br><a class="table-td-link" href="javascript:getCDEData(\'{{:cdeId}}\');">Values</a> , <a class="table-td-link" href="javascript:compareGDC(\'{{:ref}}\',\'{{:cdeId}}\');"> Compare with GDC</a>'
    +'{{else cdeLen}}'
    +' , <a class="table-td-link" href="javascript:getCDEData(\'{{:cdeId}}\');">Values</a>'
    +'{{else}}'
    +''
    +'{{/if}}'
  +'{{/if}}'
  +'</div>' +
'</div> {{/for}} </div></div></div>';


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
      '<li role="presentation" class="{{if trs_active}}active{{else}}{{/if}}"><a href="#trsTab" aria-controls="trsTab" role="tab" data-toggle="tab">Search Results</a></li>' +
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
            $('#show_all').bind('click', function(){
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
  getGDCSynonyms(uid){
  	__WEBPACK_IMPORTED_MODULE_1__api__["a" /* default */].getGDCDataById(uid, function(id, items) {
 		if($('#gdc_syn_data').length){
            $('#gdc_syn_data').remove();
        }
        let html = $.templates(__WEBPACK_IMPORTED_MODULE_0__view__["a" /* default */].gdc_synonyms).render({items: items });
        let tp = window.innerHeight * 0.2;
        //display result in a table
        $(document.body).append(html);
        $("#gdc_syn_data").dialog({
                modal: false,
                position: { my: "center top+"+tp, at: "center top", of:window},
                width:"55%",
                title: "GDC Synonyms ("+items.length+")",
                open: function() {

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
  getCDEData(uid){
        __WEBPACK_IMPORTED_MODULE_1__api__["a" /* default */].getCDEDataById(uid, function(id, items) {
            //data precessing
            let tmp = [];
            items.forEach(function(item){
                let t = {};
                t.pv = item.n;
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
            if($('#caDSR_data').length){
                $('#caDSR_data').remove();
            }

            let html = $.templates(__WEBPACK_IMPORTED_MODULE_0__view__["a" /* default */].cde_data).render({items: tmp });
            let tp = window.innerHeight * 0.2;
            //display result in a table
            $(document.body).append(html);
            $("#caDSR_data").dialog({
                    modal: false,
                    position: { my: "center top+"+tp, at: "center top", of:window},
                    width:"60%",
                    title: "CaDSR Permissible Values ("+tmp.length+")",
                    open: function() {
                        $('#data-invariant').bind('click', function(){
                            $("#data-list").find('td[name="syn_area"]').each(function(){
                                let rp = $(this).html();
                                let invariant = $(this).parent().children('td[name="syn_invariant"]');
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
                    +'<div id="cpGDC_result_option"><div class="option-left"><input type="checkbox" id="compareGDC_filter"> Case Sensitive</div><div class="option-right"><input type="checkbox" id="compareGDC_unmatched"> Hide Unmatched Values</div></div>'
                    +'<div id="cpGDC_result_table">'+table+'</div>'
                    +'<div id="cpGDC_result_bottom"><span id="closeCompareGDC" class="btn-submit-large" style="margin-left: calc(50% - 2em - 10px);">Close</span></div>'
                    +'</div>';


        $("#compareGDC_dialog").dialog({
                modal: false,
                position: { my: "center top+"+tp, at: "center top", of:window},
                width:"50%",
                title: "Compare GDC Values with caDSR Values ",
                open: function() {
                    //display result in a table
                    $('#compareGDC_result').html(html);
                    let height = $('#cpGDC_result_table table:first-child').height() +1;
                    if(height >= 30 * 12.8){
                        height = 384;
                    }
                    $('#cpGDC_result_table').height(height+'px');
                    $('#closeCompareGDC').bind('click', function(){
                        $("#compareGDC_dialog").dialog('close');
                    });
                    $('#compareGDC_filter').bind('click', function(){
                        let options = {};
                        options.sensitive = $("#compareGDC_filter").prop('checked');
                        options.unmatched = $("#compareGDC_unmatched").prop('checked');
                        let table_new = generateCompareGDCResult(fromV, toV, options);
                        $('#cpGDC_result_table').html(table_new);
                        let h = $('#cpGDC_result_table table:first-child').height() +1;
                        if(h >= 30 * 12.8){
                            h = 384;
                        }
                        $('#cpGDC_result_table').height(h+'px');
                    });
                    $('#compareGDC_unmatched').bind('click', function(){
                        let options = {};
                        options.sensitive = $("#compareGDC_filter").prop('checked');
                        options.unmatched = $("#compareGDC_unmatched").prop('checked');
                        let table_new = generateCompareGDCResult(fromV, toV, options);
                        $('#cpGDC_result_table').html(table_new);
                        let h = $('#cpGDC_result_table table:first-child').height() +1;
                        if(h >= 30 * 12.8){
                            h = 384;
                        }
                        $('#cpGDC_result_table').height(h+'px');
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
          +'<div class="option-right"><input type="checkbox" id="show_all"> Show all GDC values</div>'
          +'{{else}}'
          +''
          +'{{/if}}'
          +'<div id="gdc-data-list" class="div-list">'
          +'{{if target !== null }}'
            +'{{for items}}'
            +'{{if n == ~root.target }}'
            +'<div><b>{{:#getIndex() + 1}}.</b> {{:n}}</div>'
            +'{{else}}'
            +'<div style="display: none;"><b>{{:#getIndex() + 1 }}.</b>{{:n}}</div>'
            +'{{/if}}'
            +'{{/for}}'
          +'{{else}}'
            +'{{for items}}'
            +'<div><b>{{:#getIndex() + 1}}.</b> {{:n}}</div>'
            +'{{/for}}'
          +'{{/if}}'
          +'</div>'
          +'</div>',
  gdc_synonyms: '<div id="gdc_syn_data"><div id="gdc-syn-data-list" class="div-list">'
          +'<table class="table"><tbody><tr class="data-table-head"><td width="5%"></td><td width="25%">PV</td><td width="25%">NCIt</td><td width="45%">Synonyms</td></tr>'
            +'{{for items}}'
            +'<tr class="data-table-row"><td><b>{{:#getIndex() + 1}}.</b></td><td>{{:n}}</td><td>{{:n_c}}</td><td>'
            +'{{for s}}'
            +'{{>#data}}<br>'
            +'{{/for}}'
            +'</td></tr>'
            +'{{/for}}'
          +'</tbody></table></div>'
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
                            +'<div><b>{{:#getIndex() + 1}}.</b>{{:n}}</div>'
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
                +'<div class="option-right"><input type="checkbox" id="data-invariant"> Show Duplicates</div>'
              +'</div>'
              +'<div id="data-list" class="div-list">'
              +'<table><tbody><tr class="data-table-head"><td width="5%"></td><td width="15%">PV</td><td width="40%">Description</td><td width="40%">NCIt Code and Synonyms</td></tr>'
              +'{{for items}}'
              +'<tr class="data-table-row"><td><b>{{:#getIndex() + 1}}.</b></td><td>{{:pv}}</td><td>{{:pvd}}</td>'
              +'<td name="syn_area"><table><tbody>'
                +'{{for i_rows}}'
                +'<tr class=""><td><a class="table-td-link" href="https://ncit.nci.nih.gov/ncitbrowser/pages/concept_details.jsf?dictionary=NCI_Thesaurus&code={{:pvc}}" target="_blank">{{:pvc}}</a></td><td class="td-split">'
                +'{{for s}}'
                +'{{>#data}}<br>'
                +'{{/for}}'
                +'</td></tr>'
                +'{{/for}}'
              +'</tbody></table></td>'
              +'<td name="syn_invariant" style="display:none;">'
              +'<table><tbody>'
                +'{{for rows}}'
                +'<tr class=""><td><a class="table-td-link" href="https://ncit.nci.nih.gov/ncitbrowser/pages/concept_details.jsf?dictionary=NCI_Thesaurus&code={{:pvc}}" target="_blank">{{:pvc}}</a></td><td class="td-split">'
                +'{{for s}}'
                +'{{>#data}}<br>'
                +'{{/for}}'
                +'</td></tr>'
                +'{{/for}}'
              +'</tbody></table>'
              +'</td></tr>'
              +'{{/for}}'
              +'</tbody></table></div>'
            +'</div>'
};

/* harmony default export */ __webpack_exports__["a"] = (tmpl);

/***/ })
/******/ ]);