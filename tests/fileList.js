var fs = require('fs');

var obj = {
    data: []
}

fs.readdir("tests/output_js_tests", (err, filenames) => {
    if (err) throw err;
    filenames.forEach(filename => {
        if(filename !== 'e2e_results.xml'){
            obj.data.push({text : filename});
        }
    });

    var json = JSON.stringify(obj);

fs.writeFile ("tests/myjsonfile.json", json, function(err) {
    if (err) throw err;
    }
);
});

