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

    fs.writeFile("tests/mytxtfile.txt", data, function (err) {
        if (err) throw err;
    }
    );
});

