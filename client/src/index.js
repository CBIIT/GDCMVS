
import func from './search-bar/';
import dialog from './dialog/'

$("#search").bind("click", func.search);

$("#keywords").bind("keypress", func.gotoSearch);

$("#keywords").bind("keydown", func.selectSuggestion);

$("#keywords").bind("input", func.suggest);

$(document).on('click',func.removeBox);

function getGDCData(prop, target){
	let uid = prop.replace(/@/g, '/');
	dialog.getGDCData(uid, target);
}

window.getGDCData = getGDCData;

function getGDCSynonyms(prop){
	let uid = prop.replace(/@/g, '/');
	dialog.getGDCSynonyms(uid);
};

window.getGDCSynonyms = getGDCSynonyms;

function toCompare(prop){
	let uid = prop.replace(/@/g, '/');
	dialog.toCompare(uid);
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
    dialog.getCDEData(cdeId);
}

window.getCDEData = getCDEData;

function compareGDC(prop, cdeId){
    let uid = prop.replace(/@/g, '/');
    dialog.compareGDC(uid, cdeId);
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
