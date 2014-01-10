
/*
 * Module dependencies.
 */

var debug = require('debug')('shoelace-expand:main');

var fs = require('fs');
var path = require('path');

var clearfix = require('rework-clearfix');
var breakpoints = require('rework-breakpoints');
var macros = require('rework-macro');
var mixins = require('rework-mixins');
var myth = require('myth');
var calc = require('rework-calc');
var rework = require('rework');
var vars = require('rework-vars');
var variant = require('rework-variant');

var resolve = require('../lib/resolve');
var whitespace = require('../lib/utils').whitespace;
var condense = require('../lib/condense');

/*
 * Expose `Expand`
 */

module.exports = Expand;

/*
 * Expand raw styles to CSS
 * @param {String} raw
 * @param {Object} opt
 * @param {Function} fn
 */

function Expand(string, opt) {
  opt = opt || {};

  // process whitespace significance
  var processed = whitespace(string);

  // proc css
  var css = rework(processed)
    .use(resolve(opt))
    .use(macros)
    .use(breakpoints)
    .use(calc)
    .use(clearfix)
    .use(myth)
    .use(rw('colors'))
    .use(rw('ease'))
    .use(rw('extend'))
    .use(rw('references'))
    .use(mix(mixins))
    .use(vars(opt.variables))
    .use(variant())
    .use(calc)

  return condense(css.toString());
}


function mix(mixin){
  return rework.mixins(mixin);
}

function rw(prop, arg){
  if (arg) return rework[prop](arg);
  return rework[prop]();
}
