
var debug = require('debug')('shoelace-expand:condense');
var Clean = require('clean-css');
var pretty = require('cssbeautify');
var rework = require('rework');

module.exports = condense;

function condense(string){
  // debug('string', string);

  var options = {
    keepBreaks: true,
    debug: true,
    selectorsMergeMode: 'ie8'
  };

  var minified = new Clean(options).minify(string);
  // debug('minified', minified);
  var prettified = pretty(minified);
  var reworked = rework(prettified);
  return reworked;
}
