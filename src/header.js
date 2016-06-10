// UMD (Universal Module Definition)
(function (root, factory)
{
  if (typeof define === 'function' && define.amd) // jshint ignore:line
  {
    // AMD. Register as an anonymous module.
    define([], factory);  // jshint ignore:line
  }
  else if (typeof module === 'object' && module.exports)  // jshint ignore:line
  {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory();  // jshint ignore:line
  }
  else
  {
    // Browser globals (root is window)
    root.Unitz = factory();
  }
}(this, function()
{

  function isString(x)
  {
    return typeof x === 'string';
  }

  function isObject(x)
  {
    return x !== null && typeof x === 'object';
  }

  function isNumber(x)
  {
    return typeof x === 'number' && !isNaN(x);
  }

  function isArray(x)
  {
    return x instanceof Array;
  }

  var classes = [];
  var classMap = {};
  var units = {};
