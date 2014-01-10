/**
 * Module dependencies
 */

var whitespace = require('./utils').whitespace;
var rework = require('rework');
var extend = rework.extend;
var colors = rework.extend;
var refrences = rework.extend;
var mixins = require('rework-mixins');
var breakpoints = require('rework-breakpoints');
var myth = require('myth');
var calc = require('rework-calc');

module.exports = function(root, modules) {
  var comp = new Compiler(modules);
  var out = comp.load(root);
  out
    .use(extend())
    .use(colors())
    .use(refrences())
    .use(rework.mixins(mixins))
    .use(breakpoints)
    .use(myth)
    .use(calc);
  return out;
};

function compile(comp, name) {
  return function(style) {
    comp.parse(style, name);
  };
}

function Compiler (modules) {
  this.modules = modules;
  this.requires = {};
  this.exports = {};
  this.locals = {};
}

Compiler.prototype.load = function(fn, name) {
  if (typeof fn === 'string') {
    var mod = this.modules[fn];
    if (!mod) throw new Error('could not find module ' + fn);
    name = fn;
    fn = mod._main;
  }

  var processed = whitespace(fn());
  var out = rework(processed, {source: name})
    .use(calc)
    .use(compile(this, name));
  out.mod = name;
  return out;
};

Compiler.prototype.parse = function(style, name) {
  var self = this;
  var rules = [];
  style.rules.forEach(function(rule) {
    if (select(rule, ':require')) return self.handleRequire(rule, name, rules);
    if (select(rule, ':content')) return self.handleContent(rule, name, rules);
    if (select(rule, ':exports')) return self.handleExports(rule, name, rules);
    if (select(rule, ':locals')) return self.handleLocals(rule, name, rules);
    if (select(rule, '%')) return self.handlePlaceholders(rule, name, rules);
    // resolve variable declarations
    rule.declarations.forEach(function(dec) {
      if (dec.value.indexOf('$') !== 0) return;
      // it's imported
      if (~dec.value.indexOf('/')) {
        var parts = dec.value.split('/');
        var local = parts[0].replace('$', '');
        // TODO make more robust
        var resolved = self.requires[name][local];
        if (!resolved) throw new Error('could not resolve variable ' + dec.value + ' in ' + name);

        var imported = parts[1];
        // TODO make more robust
        var exported = self.exports[resolved.mod][imported];
        if (!exported) throw new Error('could not resolve variable ' + dec.value + ' in ' + name);
        dec.value = exported;
      } else {
        // TODO make more robust
        var val = self.locals[name][dec.value.replace('$', '')];
        if (!val) throw new Error('could not resolve variable ' + dec.value + ' in ' + name);
        dec.value = val;
      }
    });
    rules.push(rule);
  });
  style.rules = rules;
};

Compiler.prototype.handleRequire = function(rule, mod) {
  var self = this;
  var deps = this.requires[mod] = {};

  rule.declarations.forEach(function(dep) {
    // TODO resolve path
    var name = dep.property;
    var absolute = self.resolve(dep.value, mod);
    if (typeof absolute === 'function') return deps[name] = self.load(absolute, mod + dep.value.replace('./', '/'));
    if (!self.modules[absolute]) throw new Error('could not resolve ' + dep.value + ' from ' + mod);
    deps[name] = self.load(absolute);
  });
};

Compiler.prototype.resolve = function(path, mod) {
  // TODO improve this
  return !!~path.indexOf('./')
    ? this.modules[mod][path.replace('./', '')]
    : path;
};

Compiler.prototype.handleContent = function(rule, mod, rules) {
  var deps = this.requires[mod];

  rule.declarations.forEach(function(content) {
    var name = content.value;
    var dep = deps[name];
    if (!dep) throw new Error('could not resolve content \'' + name + '\' in \'' + mod + '\'');
    rules.push({
      type: 'comment',
      comment: 'begin content from ' + dep.mod + ' in ' + mod,
      position: {source: dep.mod}
    });
    dep.obj.stylesheet.rules.forEach(function(depRule) {
      rules.push(depRule);
    });
    rules.push({
      type: 'comment',
      comment: 'end content from ' + dep.mod + ' in ' + mod,
      position: {source: dep.mod}
    });
  });
};

Compiler.prototype.handleExports = function(rule, mod) {
  var exps = this.exports[mod] = {};
  var self = this;
  rule.declarations.forEach(function(exp) {
    if (exp.value.indexOf('%') === 0) {
      return exps[exp.property] = '%' + mod + '|' + exp.value;
    }
    if (exp.value.indexOf('$') === 0) {
      var val = self.locals[mod][exp.value.replace('$', '')];
      if (!val) throw new Error('cannot export undefined variable ' + exp.value + ' in ' + mod);
      return exps[exp.property] = val;
    }
    exps[exp.property] = exp.value;
  });
};

Compiler.prototype.handleLocals = function(rule, mod) {
  var locals = this.locals[mod] = {};

  rule.declarations.map(function(local) {
    locals[local.property] = local.value;
  });
};

Compiler.prototype.handlePlaceholders = function(rule, mod, rules) {
  rule.selectors = rule.selectors.map(function(selector) {
    return '%' + mod + '|' + selector;
  });
  rules.push(rule);
};

function select(rule, prefix) {
 return rule.selectors && rule.selectors[0] && rule.selectors[0].indexOf(prefix) === 0;
}
