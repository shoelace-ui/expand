
var debug = require('debug')('shoelace-expand:test')

var fs = require('fs');
var path = require('path');
var join = path.join;
var read = fs.readFileSync;

var whitespace = require('css-whitespace');
var expand = require('..');

readdir('test/cases');

function readdir(dir){
  process.stdout.write('\u001b[2J');
  fs.readdirSync(dir).forEach(function(file){
    if (!~file.indexOf('.sl')) return;

    var filebase = file.replace('.sl', '');
    var title = filebase.replace('.', ' ', 'g');

    var rawPath = dir + '/' + file;
    var rawData = read(rawPath, 'utf8').toString().trim();
    // debug('rawPath', rawPath);
    // debug('rawData', rawData);

    var cssPath = dir + '/' + filebase + '.css';
    var cssData = read(cssPath, 'utf8');
    // debug('cssPath', cssPath);
    // debug('cssData', cssData);

    // check whitespace
    var trim = cssData.trim();
    var last = trim.charAt(trim.length - 1);
    if (!(last === "}" || last === "/")) trim = whitespace(trim);

    // options
    var options = {
      dir: dir // npm
    };

    describe(title, function(){

      it('should work', function(done){
        var expandData = expand(rawData, options);
        if (!expandData) return done('No data');

        cssData.trim().should.equal(expandData.toString().trim());

        done();
      });
    });
  });
}
