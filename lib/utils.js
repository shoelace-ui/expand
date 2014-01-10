
var cssWS = require('css-whitespace');
var inspect = require('util').inspect;

exports = module.exports = function(){};

exports.print = function print(name, str){
  console.log(name.blue, '\n---------------'.blue)
  console.log(inspect(str));
  console.log();
  console.log(('/' + name).blue, '\n');
};

exports.whitespace = function whitespace(raw){
  // print('trim', raw);
  var re = /([^}])$/;
  var test = re.exec(raw);
  if (test && test[0]) raw = cssWS(raw);
  // print('after', raw);
  return raw;
};
