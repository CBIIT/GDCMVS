var fs = require('fs');

var data = [];

fs.readdir("tests/output_js_tests", (err, filenames) => {
    if (err) throw err;
    data.push("All test cases" );
    data.push("None");
    filenames.forEach(filename => {
        if (filename !== 'e2e_results.xml') {
            data.push(filename);
        }
    });

    var json = JSON.stringify(data);

    fs.writeFile("tests/myjsonfile.json", json, function (err) {
        if (err) throw err;
    }
    );
});

