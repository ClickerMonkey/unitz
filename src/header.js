(function(global, undefined)
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
