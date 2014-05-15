fs = require("fs");
document = {};
file_to_process = process.argv[2];
document.write = function(o) {
    var patt = /src="(.+)"/.exec(o)[1].replace("-min","");
    var doc = this;
    console.log(fs.readFileSync(patt, 'utf8'));
};
document.getElementsByTagName = function() {
    var o = {}
    o.getAttribute = function(b) {
        return o[b];
    };
    o.src = file_to_process;
    return [o]; 
};
require(file_to_process.replace(".js",""));
document.write('src="append.js"');
