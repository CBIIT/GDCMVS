module.exports = (htmlPath,jsPath,templateVar, testFile)=>{

    // Load Dependencies
    const fs = require('fs');
    const path = require('path');
    
    // Load Configs, Template
    const config=require('./config'),
    {waitTime, pauseTime}=config;
    // Shared Variables
    let template = '',
    baseUrl = '';
    
    
    function elementExtractor(tag,doc){
        let startTag = `<${tag}>`;
        let stopTag = `</${tag}>`;
        let tagLen = tag.length;
        let elem = [];
    
    
        while(doc.indexOf(startTag)!==-1){
            let startPos = doc.indexOf(startTag)+tagLen+2;
            let stopPos = doc.indexOf(stopTag);
    
            elem.push(doc.slice(startPos,stopPos));
            doc=doc.slice(stopPos+tagLen+3);
        }
    
        return elem;
    }
    
    
    function elementExtractorOrder(tag,doc){
        let docArray = elementExtractor(tag,doc);
    
        // Error handle---------------------------
        if(docArray.length!==3){
            throw `ERROR: Can't create order object (number of <td> element not equal 3)`;
        }
    
        let orderObject={
            order:docArray[0],
            selector:docArray[1],
            mis:docArray[2]
        };
    
        return orderObject;
    }
    
    
    
    function getAllOrder(doc){
        let allOrder = [];
    
        let tables = elementExtractor('tbody',doc);
    
        // Error handle---------------------------
        if (tables.length!==1) throw `ERROR: only one <tbody> element accept`;
    
        tables.forEach(table=>{
            tableEach = elementExtractor('tr',table);
            // Error handle---------------------------
            if (tableEach.length===0) throw `ERROR: need at least one command (<tr> element)`;
    
                tableEach.forEach(trs=>{
                    trsEach=elementExtractorOrder('td',trs)
                    allOrder.push(trsEach);
                })
        })
    
        return allOrder;
    }
    
    function convertXhtml(text){
        let entityMap = {
            '&amp;':'&',
            '&gt;':'>',
            '&lt;':'<',
            '&quot;':'"',
            '&nbsp;':' '
        };
    
        for(var e in entityMap){
            text=text.replace(new RegExp(e,'g'),entityMap[e]);
        }
    
        return text;
    }
    
    
    
    function interpretOrder(order){
        // Check baseUrl
        if (baseUrl.length===0) throw `ERROR: You should indicate base url`;
    
        // use {-selector-},{-mis-}
        let findElementOrder=`driver.findElement({-selector-})`;
        let mappingOrder={
            'open':`driver.get("${baseUrl}"+"{-selector-}");`,
            'click':`${findElementOrder}.click();`,
            'clickAndWait':`${findElementOrder}.click();`,
    
            'waitForElementPresent':`driver.wait(until.elementLocated({-selector-}),${waitTime});`,
            'waitForTitle':`driver.wait(until.titleIs({-selector-})),${waitTime});`,
    
            'type':`${findElementOrder}.sendKeys('{-mis-}');`,
            'typeAndWait':`${findElementOrder}.sendKeys('{-mis-}');`,
    
            'select':`${findElementOrder}.sendKeys('{-mis-}');`,
    
            'assertText':`${findElementOrder}.getText().then(text=> {
                assert(text == '{-mis-}');
                done();
            });`,
    
            'assertTitle':`driver.getTitle().then(title=> {
                assert(title == '{-selector-}');
                done();
            });`,
    
            'pause':`driver.sleep('{-selector-}');`
            
        }
    
    
        if(!mappingOrder[order]) throw `ERROR: order type: '${order}' is not supported`;
    
        return mappingOrder[order];
    }
    
    function interpretSelector(selector){
        selector=convertXhtml(selector);
        let template;
        let startPos;
    
        if(selector.indexOf('css=')!==-1){
            template='By.css(\"{-body-}\")';
            startPos=4;
        }
    
        if(selector.indexOf('id=')!==-1){
            template='By.id(\"{-body-}\")';
            startPos=3;
        }
    
        if(selector.indexOf('//')!==-1){
            template='By.xpath(\"{-body-}\")';
            startPos=0;
        }
    
        if(selector.indexOf('xpath=')!==-1){
            template='By.xpath(\"{-body-}\")';
            startPos=6;
        }
    
        if(selector.indexOf('link=')!==-1){
            template='By.linkText(\"{-body-}\")';
            startPos=5;
        }
    
        if(selector.indexOf('name=')!==-1){
            template='By.name(\"{-body-}\")';
            startPos=5;
        }
    
        if(selector.search(/^\d+$/)!==-1){			
            template='{-body-}';
            startPos=0;
        }
    
        
        if(template){
            return template.replace('{-body-}',selector.slice(startPos));
        }
    
        return selector;
    }
    
    // function interpretMis(mis){
    // 	if(mis.indexOf('label=')!==-1){
    // 		return mis.slice(6);
    // 	}
    
    // 	return mis;
    // }
    
    function interpretMis(mis){
        let examplesDirectory = __dirname.split(path.sep).concat(['examples']);	
        if(mis.indexOf('label=')!==-1){
            let label = mis.slice(6);
            if(path.basename(label) == label.substring((label.lastIndexOf(path.sep) + 1))) {
                label = examplesDirectory.concat([path.basename(label)]).join(path.sep);
            }
            return label;
        }
    
        // console.log(path.isAbsolute(mis));
        // console.log(path.basename(mis));
        // console.log(mis.substring((mis.lastIndexOf(path.sep) + 1)));
        /* if input is a path to a file, convert path to => CURRENT_DIR\examples\FILE_NAME */
        if(path.isAbsolute(mis) && path.basename(mis) == mis.substring((mis.lastIndexOf(path.sep) + 1))) {
            mis = examplesDirectory.concat([path.basename(mis)]).join(path.sep);
        }
    
        return mis;
    }
    
    function interpretActions(orderObj){
        let {order,selector,mis} = orderObj;
        let action;
    
        action=interpretOrder(order);
        action=action.replace('{-selector-}',interpretSelector(selector));
        action=action.replace('{-mis-}',interpretMis(mis));
    
        return action
    }
    
    function insertActions(testHtml, filename){
        // detect base URL from .html file
        preString = '<link rel="selenium.base" href="',
        searchString = '/" />',
        preIndex = testHtml.indexOf(preString) + preString.length,
        searchIndex = preIndex + testHtml.substring(preIndex).indexOf(searchString);
        baseUrl = testHtml.slice(preIndex, searchIndex);
        // console.log(baseUrl);
    
        allOrders=getAllOrder(testHtml);
        let actions='';
    
        allOrders.forEach(order=>{
            textOrder=interpretActions(order)+'\n		';
            actions+=textOrder;
        })
    
        if (template.indexOf('{-actions-}') === -1) throw `ERROR: there should be '{-actions-}' in template argument for order injection`;
        tempTemplate = template.replace('{-actions-}', actions);
        // name test case => filename
        if (template.indexOf('{-name-}') === -1) throw `ERROR: there should be '{-name-}' in template argument for name injection`;
        processedTemplate = tempTemplate.replace('{-name-}', filename);
        return processedTemplate;
    }
    
    
    function writeFile(dirnameJs,filename,testHtml){
        fs.access(dirnameJs+filename+'.js', fs.constants.R_OK | fs.constants.W_OK, (err2) => {
            fs.writeFile(dirnameJs+filename+'.js',insertActions(testHtml, filename),err=>{
                if (err) throw err;
                if (err) throw err2;			
                console.log(err2 ? 'New file generated:' : 'File already exists! Existing file will be overwritten:');			
                console.log(' '+dirnameJs+filename+'.js');
            })
        });
    }
    
    
    function readFiles(dirnameHtml,dirnameJs,onFileContent, testFile) {
    
      fs.readdir(dirnameHtml, (err, filenames)=>{
        if (err) throw err;
        filenames.forEach(filename=>{
          fs.readFile(dirnameHtml + filename, 'utf-8',(err, testHtml)=>{
            if (err) throw err;
            filename = filename.replace(/\.html/g, "");		
            
            testFile.forEach(function(data){
                if(filename === data.replace(/\.js/g, "")){
                    onFileContent(dirnameJs,filename,testHtml);
                }
            })
            
            
          });
        });
      });
    }
    
    
    // Init
    function init(dirnameHtml,dirnameJs,templateVar, testFile){
    
        template = templateVar;
        // baseUrl = baseUrlVar;
        readFiles(dirnameHtml,dirnameJs,writeFile, testFile);
        
    }
    
    init(`./${htmlPath}/`,`./${jsPath}/`,templateVar, testFile);
    
    }
    