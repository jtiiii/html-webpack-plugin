/* This loader renders the template with underscore if no other loader was found */
// @ts-nocheck
'use strict';
const _ = require('lodash');
const loaderUtils = require('loader-utils');

module.exports = function (source) {
  // Get templating options
  const options = this.query !== '' ? loaderUtils.getOptions(this) : {};
  const force = options.force || false;

  const allLoadersButThisOne = this.loaders.filter(function (loader) {
    return loader.normal !== module.exports;
  });
  // This loader shouldn't kick in if there is any other loader (unless it's explicitly enforced)
  if (allLoadersButThisOne.length > 0 && !force) {
    return source;
  }
  // Skip .js files (unless it's explicitly enforced)
  if (/\.js$/.test(this.resourcePath) && !force) {
    return source;
  }

  // The following part renders the template with lodash as aminimalistic loader
  //
  const template = _.template(source, _.defaults(options, { interpolate: /<%=([\s\S]+?)%>/g, variable: 'data' }));
  // Require !!lodash - using !! will disable all loaders (e.g. babel)
  return 'var _ = require(' + loaderUtils.stringifyRequest(this, '!!' + require.resolve('lodash')) + ');' +
    'module.exports = function (templateParams) { with(templateParams) {' +
      // Execute the lodash template
      'return (' + template.source + ')();' +
    '}}';
};
