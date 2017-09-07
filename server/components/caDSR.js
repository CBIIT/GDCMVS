/**
 * loading data from caDSR into local, and write into file.
 * including load synonmys data from NCIt
 */
'use strict';

var fs = require('fs');
var https = require('https');
var http = require('http');
var config = require('../config');
var datas = {};
var syns = {};

var loadData = function(ids){
	if(ids.length > 0){
		console.log(ids.length);
		let ncitids = [];
		let count = 0, has = 0;
		ids.forEach(function(uid){
			https.get(config.caDSR_url[0]+uid, (response) => {
			  let info = '';
			  response.on('data', (d) => {
				info += d;
			  });
			  response.on('end', function(){
			  	let parsed = JSON.parse(info);
			  	if(parsed.length > 0){
			    	https.get(config.caDSR_url[1]+parsed[0].deIdseq, (result) => {
					   	let body = '';
					   	result.on('data',(r) =>{
					   		body += r;
					   	});
					   	result.on('end', function(){
					   		let b = JSON.parse(body);
					   		let pvs = b.valueDomain.permissibleValues;
					   		let data = [];
					   		pvs.forEach(function(pv){
					   			let value = {};
					   			value.pv = pv.value;
					   			value.pvm = pv.shortMeaning;
					   			value.pvc = pv.conceptCode;
					   			value.pvd = pv.vmDescription;
					   			if(value.pvc !== null){
					   				value.pvc = value.pvc.replace('c', 'C');
					   				// value.pvc = value.pvc.replace("C00", 'C');
					   				// value.pvc = value.pvc.replace("C0", 'C');
					   			}
					   			//prepare to get synonyms from NCIt
					   			if(value.pvc !== null){
					   				if(value.pvc.indexOf(':') >= 0){
					   					let cs = value.pvc.split(":");
					   					console.log("get synonyms for :" + cs);
					   					cs.forEach(function(c){
					   						if(ncitids.indexOf(c) === -1){
							   					ncitids.push(c);
							   				}
					   					});
					   				}
					   				else{
					   					if(ncitids.indexOf(value.pvc) === -1){
						   					ncitids.push(value.pvc);
						   				}
					   				}
					   			}
					   			data.push(value);
					   		});
				   			//datas[uid] = data;
				   			//save to local
				   			let str = {};
				   			str[uid] = data;
				   			fs.appendFile("./cdeData.js", JSON.stringify(str), function(err) {
							    if(err) {
							        return console.log(err);
							    }

							    console.log(" "+data.length+" PVs for caDSR :" +uid );
							});
					   		count++;
					   		console.log("finished number:" + count);
					   		if(count >= ids.length){
					   			console.log("will search "+ ncitids.length + " NCIt element for synonyms.");
					   			synchronziedLoadSynonmys(ncitids, 0);
					   		}
					   	});
					}).on('error', (e) => {
						console.log(e);
					});
			    }
			  	
			  });

			}).on('error', (e) => {
			  console.log(e);
			});

		});
	}
	
};


var loadDataAfter = function(){
	let ncitids = [];
	//load data from synonyms
	let content = fs.readFileSync("./synonyms.js").toString();
	content = content.replace(/}{/g, ",");
	let syns = JSON.parse(content);
	//load data from conceptcode
	let cc = fs.readFileSync("./conceptcode.js").toString();
	let codes = JSON.parse(cc);
	for(var c in codes){
		let enums = codes[c];
		for(var nm in enums){
			if(enums[nm] !== "" && !(enums[nm] in syns) && ncitids.indexOf(enums[nm]) == -1){
				ncitids.push(enums[nm]);
			}
		}
	}
	//check what data is missing 
	synchronziedLoadSynonmys(ncitids, 0);
};


var synchronziedLoadSynonmys = function(ncitids, idx){
	if(idx >= ncitids.length){
		return;
	}
	console.log("searching synonyms using code: "+ ncitids[idx]);
	let syn = [];
	http.get(config.NCIt_url[2]+ncitids[idx], (rsp) => {
		  let html = '';
		  rsp.on('data', (dt) => {
			html += dt;
		  });
		  rsp.on('end', function(){
			  	if(html.trim() !== ''){
			  		// let sub = html;
			  		// let index = 0;
			  		// let pool = [];
			  		// while(true){
			  		// 	index = sub.indexOf("<td class=\"dataCellText\" scope=\"row\">");
			  		// 	if(index === -1){
			  		// 		break;
			  		// 	}
			  		// 	sub = sub.substr(index+37);
			  		// 	index = sub.indexOf("</td>");
			  		// 	if(idx !== -1){
			  		// 		let s = sub.substr(0,index).trim();
			  		// 		s = decodeHtmlEntity(s);
			  		// 		if(pool.indexOf(s) === -1){
			  		// 			pool.push(s);
			  		// 			syn.push(s);
			  		// 		}
			  		// 		sub = sub.substr(index+5);
			  		// 	}
			  		// 	else{
			  		// 		break;
			  		// 	}
			  		// }
			  		let d = JSON.parse(html);
			  		if(d.synonyms !== undefined){
			  			let syns = d.synonyms;
				  		let pool = [];
				  		syns.forEach(function(s){
				  			if(pool.indexOf(s.termName) === -1){
				  					pool.push(s.termName);
				  					syn.push(s.termName);
				  			}
				  		});
				  		let str = {};
				  		str[ncitids[idx]] = syn;
				  		fs.appendFile("./synonyms.js", JSON.stringify(str), function(err) {
						    if(err) {
						        return console.log(err);
						    }

						    console.log("#########synonyms for " +ncitids[idx] +": " + syn.toString());
						});
			  		}
			  		else{
			  			console.log("!!!!!!!!!!!! no synonyms for " +ncitids[idx]);
			  		}
			  		
			  	}
			  	syns[ncitids[idx]] = syn;
			  	synchronziedLoadSynonmys(ncitids, idx+1);
  			});

	}).on('error', (e) => {
	  console.log(e);
	});
};

var decodeHtmlEntity = function(str) {
  return str.replace(/&#(\d+);/g, function(match, dec) {
    return String.fromCharCode(dec);
  });
};

var getData = function(){
	return datas;
};


var getSynonyms = function(){
	return syns;
};

module.exports = {
	loadData,
	loadDataAfter,
	getData,
	getSynonyms
};

