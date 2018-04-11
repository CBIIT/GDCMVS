var fs = require('fs');

var data = '';

fs.readdir("tests/output_js_tests", (err, filenames) => {
    if (err) throw err;
    data = data + "All test cases";
    data = data + "/None";
    filenames.forEach(filename => {
        if (filename !== 'e2e_results.xml') {
            data = data + '/' +filename;
        }
    });

    var json = JSON.stringify(data);

    fs.writeFile("tests/myjsonfile.json", json, function (err) {
        if (err) throw err;
    }
    );
});

