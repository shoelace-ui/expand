
/*
 * Module dependencies.
 */

var debug = require('debug')('shoelace-expand:resolve');
var assert = require('assert');

var path = require('path');
var fs = require('fs');
var read = fs.readFileSync;
var rework = require('rework');

var cssws = require('css-whitespace');
var parse = require('css-parse');
var resolve = require('resolve');

var whitespace = require('./utils').whitespace;

/*
 * Regexp patten matchers
 */

var ABS_URL = /^url\(|:\/\//;
var QUOTED = /^\"|\"$/g;

/*
 * Expose `Resolve`
 */

module.exports = Resolve;

/*
 * Resolve location of `.sl` or `.css` files
 * @param {Object|String} opts
 */

function Resolve(opts) {
  opts = opts || {};
  if (typeof opts === 'string') {
    opts = { dir: opts };
  }

  // debug(JSON.stringify(opts))

  opts.dir = path.resolve(opts.dir || process.cwd());
  opts.root = opts.root || opts.dir;
  opts.paths = opts.paths || [];

  return function(style) {
    // debug('style before', style.rules);
    resolveImports({}, opts, style);
    // debug('style after', style.rules);
    return style;
  };
}

function isNpmImport(path) {
  // Do not import absolute URLs */
  return !ABS_URL.test(path);
}

function resolveImports(scope, opts, style) {
  // console.log(scope);
  var output = [];
  style.rules.forEach(function(rule) {
    if (rule.type === 'import') {
      var imported = getImport(scope, opts, rule);
      // debug('imported', imported);
      output = output.concat(imported);
    } else {
      output.push(rule);
    }

    if (rule.rules) {
      // Create child scope for blocks (such as @media)
      var childScope = { __parent__: scope };
      resolveImports(childScope, opts, rule);
    }
  });

  style.rules = output;
}

function resolveImport(opts, rule) {
  var dir = opts.dir;
  var name = rule.import.replace(QUOTED, '');
  if (!isNpmImport(name)) return null;

  var modules = fs.readdirSync(dir);
  // debug('modules', modules);

  var options = {
    'basedir': dir,
    'extensions': ['.sl', '.css'],
    'package': 'component.json',
    'packageFilter': processPackage,
    // 'paths': ['another'],
    'paths': ['foobar'],
    'moduleDirectory': 'components'
  };

  // debug('options', options);

  var file = resolve.sync(name, options);
  return path.normalize(file);
}

function getImport(scope, opts, rule) {
  var file = resolveImport(opts, rule);
  if (!file) return [rule];

  // Only include a file once
  if (isImported(scope, file)) return [];

  scope[file] = true;

  var importDir = path.dirname(file);
  var importOpts = { dir: importDir, root: opts.root };
  var contents = whitespace(fs.readFileSync(file, 'utf8'));
  var styles = parse(contents, {
        position: true,
        source: path.relative(opts.root, file)
      }).stylesheet;

  // Resolve imports in the imported file
  resolveImports(scope, importOpts, styles);
  return styles.rules;
}

function processPackage(pkg) {
  pkg.main = pkg.styles && pkg.styles[0];
  debug(pkg.dependencies)
  return pkg;
}

function hasOwn(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

function isImported(scope, name) {
  return (hasOwn(scope, name)
          || (scope.__parent__ && isImported(scope.__parent__, name)));
}
