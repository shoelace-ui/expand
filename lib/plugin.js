/**
 * Module dependencies
 */

var fs = require('fs');
var path = require('path');
var read = fs.readFileSync;
var req = require('./require');

module.exports = function(builder) {
  var sl = new Shoelace(builder);
  var buildType = builder.buildType;
  builder.buildType = function(type, fn, process) {
    if (type !== 'styles') return buildType.apply(builder, arguments);
    buildType.call(builder, type, function() {
      sl.build(fn);
    }, process);
  };
  builder.hook('before styles', function(pkg) {
    sl.load(pkg);
  });
};

function Shoelace(builder) {
  this.builder = builder;
  this.modules = {};
}

Shoelace.prototype.load = function(pkg) {
  var styles = pkg.config.styles;
  if (!styles) return;
  if (pkg.root) this.root = pkg.config.repo || pkg.config.name;
  var mod = this.modules[pkg.config.repo || pkg.config.name] = {};
  styles.forEach(function(file) {
    if (!mod._main) mod._main = get;
    var cache;
    mod[file] = get;
    function get() {
      if (cache) return cache;
      cache = read(pkg.path(file), 'utf8');
      return cache;
    };
  });
  pkg.config.styles = [];
};

Shoelace.prototype.build = function(fn) {
  if (!this.root) {
    console.error('No root style file found');
    return fn(null, '');
  }
  var out = req(this.root, this.modules).toString();
  fn(null, out);
};
