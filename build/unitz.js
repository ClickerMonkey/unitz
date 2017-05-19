/* unitz 0.6.0 - A unit parser, converter, & combiner in JS by Philip Diffenderfer */
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


/**
 * A collection of functions and classes for dealing with `number unit`
 * expressions. These expressions can be converted to other units, added,
 * subtracted, transformed to a more user friendly representation, and used to
 * generate conversions for all units in the same "class".
 *
 * @namespace
 */
var Unitz = {};

/**
 * A value which can converted to a {@link Unitz.Parsed} instance.
 *
 * - `'1.5'`: A unitless value.
 * - `'1/2'`: A unitless fraction.
 * - `'2 1/3'`: A unitless fraction with a whole number.
 * - `'unit'`: A unit with a value of 1.
 * - `'0.5 unit'`: A number value with a unit.
 * - `'1/2 unit'`: A fraction with a unit.
 * - `'3 1/4 unit'`: A fraction with a whole number with a unit.
 * - `1.5`: A unitless value.
 * - `Unitz.Parsed instance`
 *
 * @typedef {String|Object|Number} parsable
 */

/**
 * An array of all unit classes.
 *
 * @memberof Unitz
 * @type {Unitz.Class[]}
 * @see Unitz.addClass
 */
var classes = [];

/**
 * A map of all unit classes where the key is their {@link Unitz.Class#className}.
 *
 * @memberof Unitz
 * @type {Object}
 * @see Unitz.addClass
 */
var classMap = {};

/**
 * A map of all units (lowercased) to their {@link Unitz.Class}
 *
 * @memberof Unitz
 * @type {Object}
 * @see Unitz.addClass
 */
var unitToClass = {};

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

/**
 * Removes a unit from its class. The group the unit to still exists in the
 * class, but the unit won't be parsed to the group anymore.
 *
 * @method
 * @memberof Unitz
 * @param {String} unit -
 *    The lowercase unit to remove from this class.
 * @return {Boolean} -
 *    True if the unit was removed, false if it does not exist in this class.
 */
function removeUnit(unit)
{
  var removed = false;

  if ( unit in unitToClass )
  {
    removed = unitToClass[ unit ].removeUnit( unit );
  }

  return removed;
}

/**
 * Removes the group which has the given unit. The group will be removed
 * entirely from the system and can no longer be parsed or converted to and
 * from.
 *
 * @method
 * @memberof Unitz
 * @param {String} unit -
 *    The lowercase unit of the group to remove.
 * @return {Boolean} -
 *    True if the group was removed, false if it does not exist in this class.
 */
function removeGroup(unit)
{
  var removed = false;

  if ( unit in unitToClass )
  {
    removed = unitToClass[ unit ].removeGroup( unit );
  }

  return removed;
}

/**
 * Determines if the given variable is a number equivalent to one (both positive
 * and negative). This is used to determine when to use the singluar or plural
 * version of a unit.
 *
 * @memberof Unitz
 * @param {Number} x -
 *    The number to check for oneness.
 * @return {Boolean} -
 *    True if the given number is equivalent to +1 or -1.
 */
function isSingular(x)
{
  return isNumber( x ) && Math.abs( Math.abs( x ) - 1 ) < Unitz.epsilon;
}

/**
 * Determines if the given variable is a whole number.
 *
 * @memberof Unitz
 * @param {Number} x -
 *    The number to check for wholeness.
 * @return {Boolean} -
 *    True if the given number is a whole number, otherwise false.
 */
function isWhole(x)
{
  return isNumber( x ) && Math.abs( Math.floor( x ) - x ) < 0.00000001;
}

/**
 * Determines whether the two units are close enough a match to be considered
 * units of the same group. This is used when units are given by the user which
 * aren't known to Unitz. It determines this by comparing the first
 * {@link Unitz.heuristicLength} characters of each unit.
 *
 * ```javascript
 * Unitz.isHeuristicMatch('loaves', 'loaf'); // true
 * Unitz.isHeuristicMatch('taco', 'tacos'); // true
 * Unitz.isHeuristicMatch('pk', 'pack'); // false
 * ```
 *
 * @memberof Unitz
 * @param {String} unitA -
 *    The first unit to test.
 * @param {String} unitB -
 *    The second string to test.
 * @return {Boolean} -
 *    True if the two units are a match, otherwise false.
 */
function isHeuristicMatch(unitA, unitB)
{
  return unitA.substring( 0, Unitz.heuristicLength ) === unitB.substring( 0, Unitz.heuristicLength );
}

/**
 * Creates a stirng representation of a value and a unit. If the value doesn't
 * have a unit then the value is returned immediately.
 *
 * @memberof Unitz
 * @param {Number|String} value -
 *    The value to add a unit to.
 * @param {String} [unit] -
 *    The unit to add to the value.
 * @return {String} -
 *    The normal representation of a value and its unit.
 */
function createNormal(value, unit)
{
  return unit ? value + ' ' + unit : value;
}

/**
 * Converts input to an array of
 *
 * @memberof Unitz
 * @param {String|Array|Object} [input] -
 *    The input to convert to an array.
 * @return {Array} -
 *    The array of converted inputs.
 * @see Unitz.combine
 * @see Unitz.subtract
 */
function splitInput(input)
{
  if ( isString( input ) )
  {
    return input.split( Unitz.separator );
  }
  if ( isArray( input ) )
  {
    return input;
  }
  if ( isObject( input ) || isNumber( input ) )
  {
    return [ input ];
  }

  return [];
}

/**
 * Parses the input and returns an instance of {@link Unitz.Parsed}. If the
 * given input cannot be parsed then `false` is returned.
 *
 * @memberof Unitz
 * @param {parsable} input -
 *    The parsable input.
 * @return {Unitz.Parsed} -
 *    The parsed instance.
 */
function parseInput(input)
{
  if ( isString( input ) )
  {
    return parse( input );
  }
  if ( isObject( input ) )
  {
    return input;
  }
  if ( isNumber( input ) )
  {
    return UnitzParsed.fromNumber( input );
  }

  return false;
}

/**
 * Parses a number and unit out of the given string and returns a parsed
 * instance. If the given input is not in a valid format `false` is returned.
 *
 * ```javascript
 * Unitz.parse('1.5'); // A unitless value.
 * Unitz.parse('1/2'); // A unitless fraction.
 * Unitz.parse('2 1/3'); // A unitless fraction with a whole number.
 * Unitz.parse('unit'); // A unit with a value of 1.
 * Unitz.parse('0.5 unit'); // A number value with a unit.
 * Unitz.parse('1/2 unit'); // A fraction with a unit.
 * Unitz.parse('3 1/4 unit'); // A fraction with a whole number with a unit.
 * Unitz.parse(''); // false
 * ```
 *
 * @memberof Unitz
 * @param {String} input -
 *    The input to parse a number & unit from.
 * @return {Unitz.Parsed} -
 *    The parsed instance.
 */
function parse(input)
{
  var group = Unitz.regex.exec( input );
  var whole = group[1];
  var numer = group[3];
  var denom = group[5];
  var decimal = group[6];
  var unit = group[7].toLowerCase();

  if ( !whole && !decimal && !unit )
  {
    return false;
  }

  var value = 1;

  if ( whole )
  {
    value = parseInt( whole );

    var sign = (value < 0 ? -1 : 1);

    if ( denom )
    {
      denom = parseInt( denom );

      if ( numer )
      {
        value += ( parseInt( numer ) / denom ) * sign;
      }
      else
      {
        value /= denom;
      }
    }
    else if ( decimal )
    {
      value += parseFloat( '0.' + decimal ) * sign;
    }
  }

  return new UnitzParsed( value, unit, unitToClass[ unit ], input );
}

/**
 * Parses a number and unit out of the given string and returns a human friendly
 * representation of the number and unit class - which is known as a compound
 * representation because it can contain as many units as necessary to
 * accurately describe the value. This is especially useful when you want
 * precise amounts for a fractional value.
 *
 * ```javascript
 * Unitz.compound('2 cups', ['pt', 'c']); // '1 pt'
 * Unitz.compound('2 cups', ['c', 'tbsp']); // '2 c'
 * Unitz.compound('0.625 cups', ['c', 'tbsp', 'tsp']); // '1/2 c, 2 tbsp'
 * Unitz.compound('1.342 cups', ['c', 'tbsp', 'tsp']); // '1 c, 5 tbsp, 1 tsp'
 * ```
 *
 * @memberof Unitz
 * @param {String} input -
 *    The input to parse a number & unit from.
 * @param {String[]} [unitsAllowed=false] -
 *    The units to be restricted to use. This can be used to avoid using
 *    undesirable units in the output. If this is not given, then all units for
 *    the parsed input may be used.
 * @return {String} -
 *    The compound string built from the input.
 */
function compound(input, unitsAllowed)
{
  var parsed = parseInput( input );
  var compound = [];

  if ( parsed.unitClass && parsed.group )
  {
    var groups = parsed.unitClass.groups;

    for (var i = groups.length - 1; i >= 0; i--)
    {
      var grp = groups[ i ];

      // If no specific units are desired OR the current group is a desired unit...
      if ( !unitsAllowed || unitsAllowed.indexOf( grp.unit ) !== -1 )
      {
        var converted = parsed.convert( grp.unit );
        var denoms = grp.denominators;

        // Try out each denominator in the given group.
        for (var k = 0; k < denoms.length; k++)
        {
          var den = denoms[ k ];
          var num = Math.floor( den * converted );

          // If the numerator to the current fraction is greater than zero then
          // use this group as the next statement in the compound string.
          if ( num >= 1 )
          {
            var actual = num / den;
            var whole = Math.floor( actual );

            var part = '';

            if ( whole >= 1 )
            {
              part += whole;
              num -= whole * den;
            }

            if ( num > 0 && den > 1 )
            {
              part += (part.length > 0 ? ' ' : '') + num + '/' + den;
            }

            part = createNormal( part, grp.unit );

            compound.push( part );

            parsed.value -= convert( part, parsed.unit );

            break;
          }
        }
      }
    }
  }

  return compound.length ? compound.join( ', ' ) : parsed.normal;
}

/**
 * Determines the best way to represent the parsable input, optionally using
 * fractions. This will look at all units available in the parsed class and
 * use the conversion which results in the closest representation with the
 * shortest string representation favoring larger units. A {@link Unitz.Parsed}
 * instance is returned with the {@link Unitz.Parsed#normal} property set to
 * the best representation.
 *
 * ```javascript
 * Unitz.best('2 pints'); // '1 quart'
 * Unitz.best('2640 ft'); // '0.5 miles'
 * Unitz.best('2640 ft', true); // '1/2 mile'
 * ```
 *
 * @memberof Unitz
 * @param {parsable} input -
 *    The input to return the best representation of.
 * @param {Boolean} [returnFraction=false] -
 *    If the best representation should attempted to be a fraction.
 * @param {Boolean} [abbreviations=false] -
 *    If the returned value should use abbreviations if they're available.
 * @param {Number} [largestDenominator] -
 *    See {@link Unitz.Fraction}.
 * @return {Unitz.Parsed} -
 *    The parsed instance with the {@link Unitz.Parsed#normal} property set to
 *    the best representation.
 */
function best(input, returnFraction, abbreviations, largestDenominator)
{
  var parsed = parseInput( input );

  if ( parsed.unitClass )
  {
    // out of all groups in class, calculate converted value fraction and
    // take the one that is a whole number or is the closest to a whole
    // number while being the closest
    var closest = null;
    var closestGroup = null;
    var groups = parsed.unitClass.groups;

    for (var i = 0; i < groups.length; i++)
    {
      var grp = groups[ i ];
      var fraction = parsed.convert( grp.unit, true );

      if ( fraction.valid )
      {
        var better = !closest;

        if ( closest )
        {
          var closeApprox = fraction.distance <= closest.distance;
          var closeString = fraction.string.length <= closest.string.length;
          var closeActual = (fraction.actual + '').length <= (closest.actual + '').length;

          if ( closeApprox && (returnFraction ? closeString : closeActual) )
          {
            better = true;
          }
        }

        if ( better )
        {
          closest = fraction;
          closestGroup = grp;
        }
      }
    }

    if ( closest )
    {
      if ( parsed === input )
      {
        parsed = new UnitzParsed( closest.actual, closestGroup.unit, parsed.unitClass );
      }
      else
      {
        parsed.value = closest.actual;
        parsed.unit = closestGroup.unit;
        parsed.group = closestGroup;
      }

      parsed.normal = returnFraction ?
        createNormal( closest.string, closestGroup.getUnit( closest.isSingular(), abbreviations ) ) :
        closestGroup.addUnit( closest.actual, abbreviations );
    }
  }

  return parsed;
}

/**
 * Converts the parsable input to the given unit. If the conversion can't be
 * done then false is returned.
 *
 * ```javascript
 * Unitz.convert('30 in', 'ft'); // 2.5
 * Unitz.convert('1 in', 'cm'); // 2.54
 * Unitz.convert('2 1/2 gal', 'qt'); // 10
 * ```
 *
 * @memberof Unitz
 * @param {parsable} input -
 *    The input to parse and convert to the given unit.
 * @param {String} unit -
 *    The unit to convert to.
 * @return {Number} -
 *    The converted number.
 */
function convert(input, unit)
{
  var parsed = parseInput( input );

  // Not valid input? return false
  if ( !isObject( parsed ) )
  {
    return false;
  }

  var value = parsed.value;
  var unitClass = parsed.unitClass;

  // If there was no unit class and no unit provided, return the unitless value.
  if ( !unitClass && !unit )
  {
    return value;
  }

  // If there was no unit class parsed OR the given unit is not in the same class then return false!
  if ( !unitClass || !(unit in unitClass.converters) )
  {
    return false;
  }

  // If the parsed unit and requested unit is the same, return the parsed value.
  if ( unitClass.groupMap[ unit ] === unitClass.groupMap[ parsed.unit ] )
  {
    return value;
  }

  // Convert the parsed value to its base unit
  value *= unitClass.converters[ parsed.unit ];

  // If they don't have the same bases convert the parsed value
  var baseFrom = unitClass.bases[ parsed.unit ];
  var baseTo = unitClass.bases[ unit ];

  if ( baseFrom !== baseTo )
  {
    value *= unitClass.mapping[ baseFrom ][ baseTo ];
  }

  // Divide the value by the desired unit.
  value /= unitClass.converters[ unit ];

  return value;
}

/**
 * Given an array of unknown units - return the singular or plural unit. The
 * singular unit is the shorter string and the plural unit is the longer string.
 *
 * @memberof Unitz
 * @param {String[]} units -
 *    The array of units to look through.
 * @param {Boolean} singular -
 *    True if the singular unit should be returned, otherwise false if the
 *    plural unit should be returned.
 * @return {String} -
 *    The singular or plural unit determined.
 */
function findUnit(units, singular)
{
  var chosen = '';

  for (var i = 0; i < units.length; i++)
  {
    var u = units[ i ];

    if ( u.length && (chosen === '' || (singular && u.length < chosen.length) || (!singular && u.length > chosen.length) ) )
    {
      chosen = u;
    }
  }

  return chosen;
}

/**
 * Adds the two expressions together into a single string. Each expression can
 * be a comma delimited string of value & unit pairs - this function will take
 * the parsed values with the same classes and add them together. The string
 * returned has expressions passed through the {@link Unitz.best} function
 * optionally using fractions.
 *
 * ```javascript
 * Unitz.combine( 2, '3 tacos' ); // '5 tacos'
 * Unitz.combine( '2 cups', '1 pt' ); // '1 quart'
 * Unitz.combine( '3 cups, 1 bag', '2 bags, 12 tacos' ); // `3 cups, 3 bags, 12 tacos'
 * ```
 *
 * @memberof Unitz
 * @param {String|parsable|parsable[]} inputA -
 *    The first expression or set of expressions to add together.
 * @param {String|parsable|parsable[]} inputB -
 *    The second expression or set of expressions to add together.
 * @param {Boolean} [fraction=false] -
 *    If the returned value should attempt to use fractions.
 * @param {Boolean} [abbreviations=false] -
 *    If the returned value should use abbreviations if they're available.
 * @param {Number} [largestDenominator] -
 *    See {@link Unitz.Fraction}.
 * @return {String} -
 *    The string representation of `inputA + inputB`.
 */
function combine(inputA, inputB, fraction, abbreviations, largestDenominator)
{
  var splitA = splitInput( inputA );
  var splitB = splitInput( inputB );
  var splitBoth = splitA.concat( splitB );
  var parsed = [];

  // Parse all inputs - ignore invalid inputs
  for (var i = 0; i < splitBoth.length; i++)
  {
    var parsedInput = parseInput( splitBoth[ i ] );

    if ( parsedInput !== false )
    {
      parsedInput.units = [];
      parsedInput.units.push( parsedInput.unit );
      parsed.push( parsedInput );
    }
  }

  // Try merging subsequent (k) parsed values into this one (i)
  for (var i = 0; i < parsed.length - 1; i++)
  {
    var a = parsed[ i ];

    for (var k = parsed.length - 1; k > i; k--)
    {
      var b = parsed[ k ];
      var converted = b.convert( a.unit );

      // Same unit class. We can use proper singular/plural units.
      if ( converted !== false && a.group )
      {
        parsed.splice( k, 1 );

        a.value += converted;
      }
      // "a" or "b" doesn't have a unit
      else if ( !a.unit || !b.unit )
      {
        parsed.splice( k, 1 );

        a.value += b.value;
        a.units = a.units.concat( b.units );
      }
      // "a" and "b" have a similar enough unit.
      else if ( isHeuristicMatch( a.unit, b.unit ) )
      {
        parsed.splice( k, 1 );

        a.value += b.value;
        a.units = a.units.concat( b.units );
      }
    }
  }

  var combined = [];

  for (var i = 0; i < parsed.length; i++)
  {
    var a = parsed[ i ];

    if ( a.group )
    {
      a.normal = a.group.addUnit( a.value, abbreviations );
    }
    else
    {
      a.unit = findUnit( a.units, isSingular( a.value ) );
      a.normal = createNormal( a.value, a.unit );
    }

    var parsedBest = best( a, fraction, abbreviations, largestDenominator );

    if ( parsedBest && parsedBest.normal )
    {
      combined.push( parsedBest.normal );
    }
  }

  return combined.join( Unitz.separatorJoin );
}

/**
 * Subtracts the second expression from the first expression and returns a
 * string representation of the results. Each expression can be a comma
 * delimited string of value & unit pairs - this function will take
 * the parsed values with the same classes and subtract them from each other.
 * The string returned has expressions passed through the {@link Unitz.best}
 * function optionally using fractions. By default negative quantities are not
 * included in the result but can overriden with `allowNegatives`.
 *
 * ```javascript
 * Unitz.subtract( '3 tacos', '1 taco' ); // '2 tacos'
 * Unitz.subtract( 4, 1 ); // '3'
 * Unitz.subtract( '3 cups, 1 bag', '2 bags, 12 tacos' ); // `3 cups'
 * ```
 *
 * @memberof Unitz
 * @param {String|parsable|parsable[]} inputA -
 *    The expression to subtract from.
 * @param {String|parsable|parsable[]} inputB -
 *    The expression to subtract from `inputA`.
 * @param {Boolean} [allowNegatives=false] -
 *    Whether or not negative values should be included in the results.
 * @param {Boolean} [fraction=false] -
 *    If the returned value should attempt to use fractions.
 * @param {Boolean} [abbreviations=false] -
 *    If the returned value should use abbreviations if they're available.
 * @param {Number} [largestDenominator] -
 *    See {@link Unitz.Fraction}.
 * @return {String} -
 *    The string representation of `inputA - inputB`.
 */
function subtract(inputA, inputB, allowNegatives, fraction, abbreviations, largestDenominator)
{
  var splitA = splitInput( inputA );
  var splitB = splitInput( inputB );
  var splitBoth = splitA.concat( splitB );
  var parsed = [];

  // Parse all inputs - ignore invalid inputs
  for (var i = 0; i < splitBoth.length; i++)
  {
    var parsedInput = parseInput( splitBoth[ i ] );

    if ( parsedInput !== false )
    {
      parsedInput.sign = i >= splitA.length ? -1 : 1;
      parsedInput.units = [];
      parsedInput.units.push( parsedInput.unit );
      parsed.push( parsedInput );
    }
  }

  // Try merging subsequent (k) parsed values into this one (i)
  for (var i = 0; i < parsed.length - 1; i++)
  {
    var a = parsed[ i ];

    for (var k = parsed.length - 1; k > i; k--)
    {
      var b = parsed[ k ];
      var converted = b.convert( a.unit );
      var sign = b.sign * a.sign;

      // Same unit class. We can use proper singular/plural units.
      if ( converted !== false && a.group )
      {
        parsed.splice( k, 1 );

        a.value += converted * sign;
      }
      // "a" or "b" doesn't have a unit
      else if ( !a.unit || !b.unit )
      {
        parsed.splice( k, 1 );

        a.value += b.value * sign;
        a.units = a.units.concat( b.units );
      }
      // "a" and "b" have a similar enough unit.
      else if ( isHeuristicMatch( a.unit, b.unit ) )
      {
        parsed.splice( k, 1 );

        a.value += b.value * sign;
        a.units = a.units.concat( b.units );
      }
    }
  }

  var combined = [];

  for (var i = 0; i < parsed.length; i++)
  {
    var a = parsed[ i ];

    if ( (a.value < 0 || a.sign < 0) && !allowNegatives )
    {
      continue;
    }

    if ( a.group )
    {
      a.normal = a.group.addUnit( a.value, abbreviations );
    }
    else
    {
      a.unit = findUnit( a.units, isSingular( a.value ) );
      a.normal = createNormal( a.value, a.unit );
    }

    var parsedBest = best( a, fraction, abbreviations, largestDenominator );

    if ( parsedBest && parsedBest.normal )
    {
      combined.push( parsedBest.normal );
    }
  }

  return combined.join( Unitz.separatorJoin );
}

/**
 * Parses the given input and returns a {@link Unitz.Parsed} instance with a new
 * `conversions` property which is an array of {@link Unitz.Conversion}s.
 * The array of conversions generated can be limited by minimum and maximum
 * numbers to only return human friendly conversions.
 *
 * ```javascript
 * Unitz.conversions('2.25 hrs', 0.1, 1000); // '135 minutes', '2 1/4 hours'
 * ```
 *
 * @memberof Unitz
 * @param {parsable} input -
 *    The input to generate conversions for.
 * @param {Number} [min] -
 *    If given, the conversions returned will all have values above `min`.
 * @param {Number} [max] -
 *    If given, the conversions returned will all have values below `max`.
 * @param {Number} [largestDenominator] -
 *    See {@link Unitz.Fraction}.
 * @return {Unitz.Parsed} -
 *    The instance parsed from the input with a `conversions` array. If the
 *    parsed input is not valid or has a unit class then the input given is
 *    returned.
 */
function conversions(input, min, max, largestDenominator)
{
  var parsed = parseInput( input );

  if ( !isObject( parsed ) || !parsed.unitClass )
  {
    return input;
  }

  var groups = parsed.unitClass.groups;
  var conversions = parsed.conversions = [];

  for (var i = 0; i < groups.length; i++)
  {
    var grp = groups[ i ];
    var converted = parsed.convert( grp.unit );

    if ( !isNumber( converted ) )
    {
      continue;
    }

    if ( isNumber( min ) && converted < min )
    {
      continue;
    }

    if ( isNumber( max ) && converted > max )
    {
      continue;
    }

    var fraction = new UnitzFraction( converted, grp.denominators, largestDenominator );

    conversions.push(new UnitzConversion( converted, fraction, grp ));
  }

  return parsed;
}

/**
 * Adds a new {@link Unitz.Class} to Unitz registering all converters in the
 * class to be available for parsing.
 *
 * @memberof Unitz
 * @param {Unitz.Class} unitClass -
 *    The unit class to add.
 */
function addClass(unitClass)
{
  classMap[ unitClass.className ] = unitClass;
  classes.push( unitClass );

  for (var unit in unitClass.converters)
  {
    unitToClass[ unit ] = unitClass;
  }
}


/**
 * Instantiates a new class instance with a name. A class stores information on
 * how to convert values between units, the set of valid strings to denote a
 * unit group, the singular and plural versions of a unit, and the valid
 * fraction denominators for that unit.
 *
 * @memberof Unitz
 * @alias Class
 * @class
 * @constructor
 * @param {String} className -
 *    The name of the class.
 */
function UnitzClass(className)
{
  /**
   * The name of the class.
   *
   * @member {String}
   */
  this.className = className;

  /**
   * The map of numbers it takes to get from one unit to another.
   *
   * @member {Object}
   */
  this.converters = {};

  /**
   * The map of numbers it takes to get from one base unit to another base unit.
   * There can be multiple systems in a single class (like Imperial vs Metric)
   * and when conversion takes place in {@link Unitz.convert} from one system
   * to another this map is used.
   *
   * @member {Object}
   */
  this.mapping = {};

  /**
   * A map of unit aliases to their base unit.
   *
   * @member {Object}
   */
  this.bases = {};

  /**
   * The array of groups in this class.
   *
   * @member {Unitz.Group[]}
   */
  this.groups = [];

  /**
   * The map of unit aliases to their group.
   *
   * @member {Object}
   */
  this.groupMap = {};
}

UnitzClass.prototype =
{

  /**
   * Adds a unit group to this class. A unit group is a unit relative to another
   * unit and has it's own aliases for the unit, singluar & plural
   * representations, and denominators to make unit-friendly fractions. The
   * group added to this class is returned.
   *
   * @method
   * @memberof Unitz.Class#
   * @param {Number} relativeValue -
   *    The value to scale by to get from the `relativeTo` unit to this unit
   *    group. If this is a base unit then this value should be 1 and the
   *    `relativeTo` should be not given.
   * @param {String} relativeTo -
   *    The unit the unit group being added is relative to. This should not be
   *    given when defining a base unit.
   * @param {String[]} units -
   *    The aliases for the unit group being added, each are valid ways to
   *    represent this group. These MUST be in lowercase form.
   * @param {Number[]} denominators -
   *    The denominators that are valid for the group being added. This is used
   *    so you don't see odd fractions that don't make sense for the given unit.
   * @param {String} singular -
   *    The singular unit (when a |value| is 1) to use for the added group.
   * @param {String} plural -
   *    The plural unit (when a |value| is not 1) to use for the added group.
   * @return {Unitz.Group} -
   *    The unit group added to this class.
   */
  addGroup: function(relativeValue, relativeTo, units, denominators, singular, plural)
  {
    var mainUnit = units[ 0 ];
    var baseUnit = mainUnit;

    if ( relativeTo )
    {
      relativeValue *= this.converters[ relativeTo ];

      baseUnit = this.bases[ relativeTo ];
    }

    var group = new UnitzGroup( mainUnit, baseUnit, relativeValue, units, singular, plural, denominators );

    for (var i = 0; i < units.length; i++)
    {
      var unit = units[ i ];

      this.converters[ unit ] = relativeValue;
      this.bases[ unit ] = baseUnit;
      this.groupMap[ unit ] = group;
    }

    this.groups.push( group );

    return group;
  },

  /**
   * Removes a unit from this class. The group the unit to still exists in this
   * class, but the unit won't be parsed to the group anymore.
   *
   * @method
   * @memberof Unitz.Class#
   * @param {String} unit -
   *    The lowercase unit to remove from this class.
   * @return {Boolean} -
   *    True if the unit was removed, false if it does not exist in this class.
   */
  removeUnit: function(unit)
  {
    var exists = unit in this.converters;

    delete this.converters[ unit ];
    delete this.bases[ unit ];
    delete this.groupMap[ unit ];
    delete unitToClass[ unit ];

    return exists;
  },

  /**
   * Removes the group which has the given unit. The group will be removed
   * entirely from the system and can no longer be parsed or converted to and
   * from.
   *
   * @method
   * @memberof Unitz.Class#
   * @param {String} unit -
   *    The lowercase unit of the group to remove.
   * @return {Boolean} -
   *    True if the group was removed, false if it does not exist in this class.
   */
  removeGroup: function(unit)
  {
    var group = this.groupMap[ unit ];
    var removed = false;

    if ( group )
    {
      var units = group.units;

      for (var i = 0; i < units.length; i++)
      {
        var unit = units[ i ];

        if ( this.groupMap[ unit ] === group )
        {
          delete this.converters[ unit ];
          delete this.bases[ unit ];
          delete this.groupMap[ unit ];
          delete unitToClass[ unit ];
        }
      }

      var index = this.groups.indexOf( group );

      if ( index !== -1 )
      {
        this.groups.splice( index, 1 );

        removed = true;
      }
    }

    return removed;
  },

  /**
   * Adds a one direction conversion from one base unit to another.
   *
   * @method
   * @memberof Unitz.Class#
   * @param {String} source -
   *    The source unit.
   * @param {String} target -
   *    The target unit.
   * @param {Number} value -
   *    The value the source number needs to be multiplied by to get to the
   *    target value.
   * @see Unitz.Class#addBaseConversion
   */
  addOneBaseConversion: function(source, target, value)
  {
    if ( !(source in this.mapping) )
    {
      this.mapping[ source ] = {};
    }

    this.mapping[ source ][ target ] = value;
  },

  /**
   * Adds a bi-directional conversion from one base unit to another.
   *
   * ```javascript
   * uc.addBaseConversion( 'in', 'cm', 2.54 ); // 1 in to 2.54 cm
   * ```
   *
   * @method
   * @memberof Unitz.Class#
   * @param {String} source -
   *    The source unit.
   * @param {String} target -
   *    The target unit.
   * @param {Number} value -
   *    The value the source number needs to be multiplied by to get to the
   *    target value.
   * @see Unitz.Class#addBaseConversion
   */
  addBaseConversion: function(source, target, value)
  {
    this.addOneBaseConversion( source, target, value );
    this.addOneBaseConversion( target, source, 1.0 / value );
  }

};


/**
 * Instantiates a new unit group. A unit group is a single unit and all of it's
 * aliases, singular & plural versions, and all valid denominators when
 * converting to a fraction.
 *
 * @memberof Unitz
 * @alias Group
 * @class
 * @constructor
 * @param {String} mainUnit -
 *    The main unit for the group. This is typically the most common short
 *    version for the unit.
 * @param {String} baseUnit -
 *    The unit this group is calculated relative to.
 * @param {Number} baseScale -
 *    The value used to calculate between this group and the base group.
 * @param {String[]} units -
 *    The aliases for this unit, each are valid ways to represent this group.
 *    These MUST be in lowercase form.
 * @param {String} singular -
 *    The singular unit (when a |value| is 1) to use.
 * @param {String} plural -
 *    The plural unit (when a |value| is not 1) to use.
 * @param {Number[]} denominators -
 *    The denominators that are valid for this group. This is used so you don't
 *    see odd fractions that don't make sense for the given unit.
 * @see Unitz.Class#addGroup
 */
function UnitzGroup(mainUnit, baseUnit, baseScale, units, singular, plural, denominators)
{
  /**
   * The main unit for the group. This is typically the most common short
   * version for the unit.
   *
   * @member {String}
   */
  this.unit = mainUnit;

  /**
   * The unit this group is calculated relative to.
   *
   * @member {String}
   */
  this.baseUnit = baseUnit;

  /**
   * The value used to calculate between this group and the base group.
   *
   * @member {Number}
   */
  this.baseScale = baseScale;

  /**
   * The aliases for this unit, each are valid ways to represent this group.
   * These MUST be in lowercase form.
   *
   * @member {String[]}
   */
  this.units = units;

  /**
   * The singular unit (when a |value| is 1) to use.
   *
   * @member {String}
   */
  this.singular = singular;

  /**
   * The plural unit (when a |value| is not 1) to use.
   *
   * @member {String}
   */
  this.plural = plural;

  /**
   * The denominators that are valid for this group. This is used so you don't
   * see odd fractions that don't make sense for the given unit.
   *
   * @member {Number[]}
   */
  this.denominators = denominators;

}

UnitzGroup.prototype =
{

  /**
   * Adds the appropriate unit to the given number based on whether its a
   * singular or plural value.
   *
   * ```javascript
   * group.addUnit( 1 ); // '1 unit'
   * group.addUnit( 2 ); // '2 units'
   * group.addUnit( 0.5 ); // '0.5 units'
   * ```
   *
   * @method
   * @memberof Unitz.Group#
   * @param {Number} x -
   *    The number to add the appropriate unit to.
   * @param {Boolean} [abbreviations=true] -
   *    Whether to return the abbrevation instead of the long units.
   * @see Unitz.isSingular
   * @see Unitz.createNormal
   * @return {String}
   */
  addUnit: function(x, abbreviations)
  {
    return createNormal( x, this.getUnit( x, abbreviations ) );
  },

  /**
   * Gets the appropriate unit for the given number based on whether its a
   * singular or plural value.
   *
   * ```javascript
   * group.getUnit( 1 ); // 'unit'
   * group.getUnit( 2 ); // 'units'
   * group.getUnit( 0.5 ); // 'units'
   * ```
   *
   * @method
   * @memberof Unitz.Group#
   * @param {Number} x -
   *    The number to determine the appropriate unit for.
   * @param {Boolean} [abbreviations=true] -
   *    Whether to return the abbrevation instead of the long units.
   * @see Unitz.isSingular
   * @return {String}
   */
  getUnit: function(x, abbreviations)
  {
    return abbreviations ? this.unit : (isSingular( x ) ? this.singular : this.plural);
  }

};


/**
 * Instantiates a new parsed instance with a number, unit, string representation,
 * and optionally the unit class if the unit was recognized by Unitz.
 *
 * @memberof Unitz
 * @alias Parsed
 * @class
 * @constructor
 * @param {Number} value -
 *    The parsed number.
 * @param {String} unit -
 *    The unit for the number (empty string if no unit specified).
 * @param {Unitz.Class} [unitClass] -
 *    The class for the unit (if any).
 * @param {String} normal -
 *    The normalized representation of the number and unit combined. If a unit
 *    class is given this will be re-calculated using the proper singular/plural
 *    unit for it's group.
 */
function UnitzParsed(value, unit, unitClass, normal)
{
  /**
   * The current parsed value.
   *
   * @member {Number}
   */
  this.value = value;

  /**
   * The unit for the current value (if any).
   *
   * @member {String}
   */
  this.unit = unit;

  /**
   * The class of the unit (if any).
   *
   * @member {Unitz.Class}
   */
  this.unitClass = unitClass;

  /**
   * The group of the unit (if any).
   *
   * @member {Unitz.Group}
   */
  this.group = unitClass ? unitClass.groupMap[ unit ] : null;

  /**
   * The string representation of the parsed value. If this instance has a group
   * this will be the current value with the appropriate singular/plural unit -
   * otherwise this will be the input passed to the {@link Unitz.parse} function.
   *
   * @member {String}
   */
  this.normal = this.group ? this.group.addUnit( value ) : normal;
}

UnitzParsed.prototype =
{

  /**
   * Converts the current value to another unit. The default behavior is to
   * return a number in the desired unit - however you can specify a truthy value
   * for `returnFraction` and a {@Unitz.Fraction} will be returned. If the unit
   * to convert to is not a valid unit for this Parsed value - false will be
   * returned.
   *
   * ```javascript
   * var p = Unitz.parse('2 cups');
   * p.convert('qt');                 // 0.5
   * p.convert('qt', true);           // '1/2'
   * p.convert('qt', false, true);    // '0.5 qt'
   * p.convert('qt', true, true);     // '1/2 qt'
   *
   * var q = Unitz.parse('0.125 trees'); // unknown unit
   * q.convert('trees', true, true, 10, [2, 4, 8, 16]); // '1/8 trees'
   * ```
   *
   * @method
   * @memberof Unitz.Parsed#
   * @param {String} to -
   *    The unit to convert the current value to.
   * @param {Boolean} [returnFraction=false] -
   *    Whether the resulting conversion should return a {@link Unitz.Fraction}.
   * @param {Boolean} [withUnit=false] -
   *    Whether the value returned has the given unit appended to the end of it.
   *    If the returned value is a fraction the given unit will be appended to
   *    the {@link Unitz.Parsed#string} property.
   * @param {Number} [largestDenominator] -
   *    See {@link Unitz.Fraction}.
   * @param {Number[]} [classlessDenominators] -
   *    If the current value does not have a {@link Unitz.Group} (which stores
   *    the valid fraction denominators for the unit) you can specify which
   *    denominators to use when calculating the nearest fraction to the
   *    converted value.
   * @param {Boolean} [roundDown=false] -
   *    A fraction will try to find the closest value to `value` - sometimes the
   *    closest fraction is larger than the given `value` and it is used. You can
   *    pass true to this constructor and it will make sure the fraction determined
   *    is never over the given `value`.
   * @see Unitz.Fraction
   * @return {Number|String|Unitz.Fraction|false}
   */
  convert: function(to, returnFraction, withUnit, largestDenominator, classlessDenominators, roundDown)
  {
    var converted = convert( this, to );

    if ( converted !== false && returnFraction )
    {
      var denominators = this.group ? this.group.denominators : classlessDenominators;

      if ( isArray( denominators ) )
      {
        converted = new UnitzFraction( converted, denominators, largestDenominator, roundDown );

        if ( isObject( converted ) && withUnit && to )
        {
          converted.string = createNormal( converted.string, to );
        }
      }
    }

    if ( withUnit && isNumber( converted ) && to )
    {
      converted = createNormal( converted, to );
    }

    return converted;
  },

  /**
   * Determines the best way to represent the current value. {@link Unitz.best}
   *
   * @param {Boolean} [returnFraction=false] -
   *    Whether the {@link Unitz.Parsed#normal} returned should be converted to
   *    a fraction (if a nice fraction exists).
   * @param {Boolean} [abbreviations=false] -
   *    If the returned value should use abbreviations if they're available.
   * @param {Number} [largestDenominator] -
   *    See {@link Unitz.Fraction}.
   * @see Unitz.best
   * @return {Unitz.Parsed}
   */
  best: function(returnFraction, abbreviations, largestDenominator)
  {
    return best( this, returnFraction, abbreviations, largestDenominator );
  },

  /**
   * Returns the fraction representation of this parsed value.
   *
   * @param {Boolean} [withUnit=false] -
   *    If the {@link Unitz.Fraction#string} property should have the unit added
   *    to it.
   * @param {Number[]} [denominators] -
   *    The array of denominators to use when converting the given value into a
   *    fraction. If a falsy value is given the denonimators of this parsed group
   *    will be used if a unit group has been determined.
   * @param {Number} [largestDenominator] -
   *    Sometimes you don't want to use all of the denominators in the above array
   *    (it could be from a {@link Unitz.Group}) and you would like to set a max.
   *    If the denominators given has something like `[2, 4, 8, 100]` and you
   *    don't want a fraction like `3/100` you can set the `largestDenominator` to
   *    a number lower than 100 and you won't ever get that denominator.
   * @param {Boolean} [roundDown=false] -
   *    A fraction will try to find the closest value to `value` - sometimes the
   *    closest fraction is larger than the given `value` and it is used. You can
   *    pass true to this constructor and it will make sure the fraction determined
   *    is never over the given `value`.
   * @return {Unitz.Fraction} -
   *    A new instance of Unitz.Fraction which is a representation of the parsed
   *    value.
   */
  fraction: function(withUnit, denominators, largestDenominator, roundDown)
  {
    var groupDenominators = this.group ? this.group.denominators : [];
    var fractionDenominators = denominators || groupDenominators;
    var fraction = new UnitzFraction( this.value, fractionDenominators, largestDenominator, roundDown );

    if (withUnit)
    {
      fraction.string = createNormal( fraction.string, this.unit );
    }

    return fraction;
  }

};

/**
 * Returns a unitless {@link Unitz.Parsed} instance for the given number.
 *
 * @method fromNumber
 * @memberof Unitz.Parsed
 * @param {Number} number -
 *    The value of the parsed instance returned.
 * @return {Unitz.Parsed}
 */
UnitzParsed.fromNumber = function(number)
{
  return new UnitzParsed(number, '', null, number, null);
};


/**
 * Instantiates and builds a fraction from a number given the denominators to
 * use and the largest denominator to look at for this instance.
 *
 * The fraction is calculated by using each of the denominators given and
 * calculating the nearest fraction - the denoninator that results in the
 * fraction closest to the given value is used. If no denominators are given or
 * the value is closer to a whole number than to any other fraction then the
 * fraction will have a denominator of one. If no fractions can be calculated
 * that leaves the resulting value within {@Unitz.epsilon} then this fraction
 * will be marked as "invalid".
 *
 * ```javascript
 * new Unitz.Fraction( 0.5, [2, 3, 4] ).string; // '1/2'
 * new Unitz.Fraction( 1.5, [2, 3, 4] ).string; // '1 1/2'
 * new Unitz.Fraction( 0.25, [2, 3, 4] ).string; // '1/4'
 * new Unitz.Fraction( 0.125, [2, 3, 4] ).string; // 0.125
 * new Unitz.Fraction( 0.125, [2, 3, 4, 8] ).string; // '1/8'
 * ```
 *
 * @memberof Unitz
 * @alias Fraction
 * @class
 * @constructor
 * @param {Number} value -
 *    A number to build a fraction for.
 * @param {Number[]} denominators -
 *    The array of denominators to use when converting the given value into a
 *    fraction.
 * @param {Number} [largestDenominator] -
 *    Sometimes you don't want to use all of the denominators in the above array
 *    (it could be from a {@link Unitz.Group}) and you would like to set a max.
 *    If the denominators given has something like `[2, 4, 8, 100]` and you
 *    don't want a fraction like `3/100` you can set the `largestDenominator` to
 *    a number lower than 100 and you won't ever get that denominator.
 * @param {Boolean} [roundDown=false] -
 *    A fraction will try to find the closest value to `value` - sometimes the
 *    closest fraction is larger than the given `value` and it is used. You can
 *    pass true to this constructor and it will make sure the fraction determined
 *    is never over the given `value`.
 */
function UnitzFraction(value, denominators, largestDenominator, roundDown)
{
  var distance = Math.abs( Math.floor( value ) - value );
  var denominator = 1;
  var numerator = value;

  for (var i = 0; i < denominators.length && distance > Unitz.epsilon; i++)
  {
    var den = denominators[ i ];
    var num = Math.round( value * den );
    var signdis = num / den - value;
    var dis = Math.abs( signdis );

    if ( isNumber( largestDenominator ) && den > largestDenominator )
    {
      break;
    }

    if ( roundDown && signdis > 0 )
    {
      continue;
    }

    if ( dis + Unitz.epsilon < distance )
    {
      denominator = den;
      numerator = num;
      distance = dis;
    }
  }

  /**
   * The `value` passed to the fraction constructor.
   *
   * @member {Number}
   */
  this.value = value;

  /**
   * The calculated numerator of the fraction. If the fraction is negative this
   * number will be negative. If this fraction is not valid - this will be the
   * `value` passed into the constructor.
   *
   * @member {Number}
   */
  this.numerator = numerator;

  /**
   * The calculated denominator of the fraction. If this fraction is not valid
   * this will be a 1 (valid fractions can also have a denoninator of 1 if the
   * given `value` is a whole number).
   *
   * @member {Number}
   */
  this.denominator = denominator;

  /**
   * The actual value of the fraction (numerator / denominator).
   *
   * @member {Number}
   */
  this.actual = numerator / denominator;

  /**
   * The distance the calculated fraction value (`actual`) is from the `value`
   * given in the constructor.
   *
   * @member {Number}
   */
  this.distance = distance;

  /**
   * The whole number calculated for the fraction. This will be zero for values
   * less than 1 and greater than -1.
   *
   * @member {Number}
   */
  this.whole = this.actual < 0 ? Math.ceil( this.actual ) : Math.floor( this.actual );

  /**
   * The remainder is the part that goes over the denominator when the fraction
   * has a whole number (when `|value|` is over 1).
   *
   * @member
   */
  this.remainder = Math.abs( Math.round( (value - this.whole) * denominator ) );

  /**
   * Whether or not the fraction is valid. A Fraction is valid when a fraction
   * could be calculated that is within {@link Unitz.epsilon} of the `value`
   * given to the constructor.
   *
   * @member
   */
  this.valid = denominator !== 1 || isWhole( numerator );

  /**
   * The string representation of this fraction. If the denominator is "1" or
   * the fraction is invalid then the `numerator` is returned. If the fraction
   * has a whole number component then `whole remainder/denominator` is returned
   * otherwise `numerator/denominator` is returned.
   *
   * @member
   */
  this.string = '';

  if ( denominator === 1 )
  {
    this.string = numerator + '';
  }
  else if ( this.whole === 0 )
  {
    this.string = numerator + '/' + denominator;
  }
  else if ( this.remainder !== 0 )
  {
    this.string = this.whole + ' ' + this.remainder + '/' + denominator;
  }
  else
  {
    this.string = this.whole + '';
  }
}

UnitzFraction.prototype =
{

  /**
   * Determines whether this fraction represents a singular value. Fractions are
   * handled differently than numbers - a number must be equal to 1 or -1 but
   * a fraction can be singular if between 1 and -1. This ensures that
   * expressions like describing "0.5 miles" in fraction form "1/2 mile" makes
   * sense.
   *
   * @memberof Unitz.Fraction#
   * @return {Number} -
   *    Returns 1 if this fraction describes a singular amount, otherwise 0.
   */
  isSingular: function()
  {
    return Math.ceil( Math.abs( this.actual ) ) === 1 ? 1 : 0;
  }

};


/**
 * Instantiates a new conversion instance with a converted value, it's fraction
 * representation, and the unit group.
 *
 * @memberof Unitz
 * @alias Conversion
 * @class
 * @constructor
 * @param {Number} converted -
 *    The converted value as a number.
 * @param {Unitz.Fraction} fraction -
 *    The converted value as a fraction.
 * @param {Unitz.Group} group -
 *    The group for the unit of this conversion.
 * @see Unitz.conversions
 */
function UnitzConversion(converted, fraction, group)
{
  /**
   * The converted value.
   *
   * @member {Number}
   */
  this.decimal = converted;

  /**
   * The converted fraction.
   *
   * @member {Unitz.Fraction}
   */
  this.fraction = fraction;

  /**
   * The group of the converted value.
   *
   * @member {Unitz.Group}
   */
  this.group = group;

  /**
   * The short representation for the conversion unit. This doesn't change
   * depending on the singular/plural nature of the converted value.
   *
   * @member {String}
   */
  this.shortUnit = group.unit;

  /**
   * The long representation for the conversion unit. This depends on the
   * singular/plural nature of the converted value.
   *
   * @member {String}
   */
  this.longUnit = fraction.valid ? group.getUnit( fraction.isSingular() ) : group.getUnit( converted );

  /**
   * The friendly version of the converted value - either the
   * {@link Unitz.Fraction#string} value of the fraction is valid - or the
   * {@link Unitz.Conversion#decimal} value.
   *
   * @member {String|Number}
   */
  this.friendly = fraction.valid ? fraction.string : converted;

  /**
   * The friendly version of the converted value with the short unit appended.
   *
   * @member {String}
   */
  this.shortNormal = createNormal( this.friendly, this.shortUnit );

  /**
   * The friendly version of the converted value with the long unit appended.
   *
   * @member {String}
   */
  this.longNormal = createNormal( this.friendly, this.longUnit );

}


addClass((function generateVolumeClass()
{
  var uc = new UnitzClass( 'Area' );

  uc.addGroup( 1,     null,    ['sqin', 'sq. in.', 'sq in', 'in2', 'in^2', 'square inch', 'square inches'], [2, 4, 8, 16], 'square inch', 'square inches' );
  uc.addGroup( 144,   'sqin',  ['sqft', 'sq. ft.', 'sq ft', 'ft2', 'ft^2', 'square foot', 'square feet'], [2, 4, 8, 16], 'square foot', 'square feet' );
  uc.addGroup( 9,     'sqft',  ['sqyd', 'sq. yd.', 'sq yd', 'yd2', 'yd^2', 'square yard', 'square yards'], [2, 3, 4, 8, 9, 16], 'square yard', 'square yards' );
  uc.addGroup( 4840,  'sqyd',  ['acre', 'acres'], [2, 3, 4, 8, 10], 'acre', 'acres' );
  uc.addGroup( 640,   'acre',  ['sqmi', 'sq. mi.', 'sq mi', 'mi2', 'mi^2', 'square mile', 'square miles'], [2, 3, 4, 8, 10], 'square mile', 'square miles' );

  uc.addGroup( 1,     null,    ['sqmm', 'sq. mm.', 'sq mm', 'mm2', 'mm^2', 'square millimeter', 'square millimeters'], [2, 4, 8, 16], 'square millimeter', 'square millimeters' );
  uc.addGroup( 100,   'sqmm',  ['sqcm', 'sq. cm.', 'sq cm', 'cm2', 'cm^2', 'square centimeter', 'square centimeters'], [2, 4, 8, 16], 'square centimeter', 'square centimeters' );
  uc.addGroup( 10000, 'sqcm',  ['sqm', 'sq. m.', 'sq m', 'm2', 'm^2', 'square meter', 'square meters'], [2, 4, 8, 16], 'square meter', 'square meters' );
  uc.addGroup( 1000000, 'sqm', ['sqkm', 'sq. km.', 'sq km', 'km2', 'km^2', 'square kilometer', 'square kilometers'], [2, 3, 4, 8, 9, 16], 'square kilometer', 'square kilometers' );

  uc.addBaseConversion( 'sqin', 'sqmm', 645.16 );

  return uc;

})());


addClass((function generateVolumeClass()
{
  var uc = new UnitzClass( 'Digital' );

  uc.addGroup( 1,     null,   ['bit', 'bits'], [], 'bit', 'bits' );
  uc.addGroup( 4,     'bit',   ['nibble', 'nibbles', 'nybble', 'nyble', 'half-byte', 'half byte', 'tetrade', 'semi-octet', 'quadbit', 'quartet'], [], 'nibble', 'nibbles' );
  uc.addGroup( 8,     'bit',   ['b', 'byte', 'bytes'], [2, 8], 'byte', 'bytes' );

  uc.addGroup( 1000,  'b',     ['kb', 'kilobyte', 'kilobytes'], [2, 4, 5, 10], 'kilobyte', 'kilobytes' );
  uc.addGroup( 1000,  'kb',    ['mb', 'megabyte', 'megabytes'], [2, 4, 5, 10], 'megabyte', 'megabytes' );
  uc.addGroup( 1000,  'mb',    ['gb', 'gigabyte', 'gigabytes'], [2, 4, 5, 10], 'gigabyte', 'gigabytes' );
  uc.addGroup( 1000,  'gb',    ['tb', 'terabyte', 'terabytes'], [2, 4, 5, 10], 'terabyte', 'terabytes' );
  uc.addGroup( 1000,  'tb',    ['pb', 'petabyte', 'petabytes'], [2, 4, 5, 10], 'petabyte', 'petabytes' );
  uc.addGroup( 1000,  'pb',    ['eb', 'exabyte', 'exabytes'], [2, 4, 5, 10], 'exabyte', 'exabytes' );
  uc.addGroup( 1000,  'eb',    ['zb', 'zettabyte', 'zettabytes'], [2, 4, 5, 10], 'zettabyte', 'zettabytes' );
  uc.addGroup( 1000,  'zb',    ['yb', 'yottabyte', 'yottabytes'], [2, 4, 5, 10], 'yottabyte', 'yottabytes' );

  uc.addGroup( 1024,  'b',     ['kib', 'kibibyte', 'kibibytes'], [2, 4, 8, 16], 'kibibyte', 'kibibytes' );
  uc.addGroup( 1024,  'kib',   ['mib', 'mebibyte', 'mebibytes'], [2, 4, 8, 16], 'mebibyte', 'mebibytes' );
  uc.addGroup( 1024,  'mib',   ['gib', 'gibibyte', 'gibibytes'], [2, 4, 8, 16], 'gibibyte', 'gibibytes' );
  uc.addGroup( 1024,  'gib',   ['tib', 'tebibyte', 'tebibytes'], [2, 4, 8, 16], 'tebibyte', 'tebibytes' );
  uc.addGroup( 1024,  'tib',   ['pib', 'pebibyte', 'pebibytes'], [2, 4, 8, 16], 'pebibyte', 'pebibytes' );
  uc.addGroup( 1024,  'pib',   ['eib', 'exbibyte', 'exbibytes'], [2, 4, 8, 16], 'exbibyte', 'exbibytes' );
  uc.addGroup( 1024,  'eib',   ['zib', 'zebibyte', 'zebibytes'], [2, 4, 8, 16], 'zebibyte', 'zebibytes' );
  uc.addGroup( 1024,  'zib',   ['yib', 'yobibyte', 'yobibytes'], [2, 4, 8, 16], 'yobibyte', 'yobibytes' );

  uc.addGroup( 1000,  'bit',   ['kbit', 'kilobit', 'kilobits'], [2, 4, 5, 10], 'kilobit', 'kilobits' );
  uc.addGroup( 1000,  'kbit',  ['mbit', 'megabit', 'megabits'], [2, 4, 5, 10], 'megabit', 'megabits' );
  uc.addGroup( 1000,  'mbit',  ['gbit', 'gigabit', 'gigabits'], [2, 4, 5, 10], 'gigabit', 'gigabits' );
  uc.addGroup( 1000,  'gbit',  ['tbit', 'terabit', 'terabits'], [2, 4, 5, 10], 'terabit', 'terabits' );
  uc.addGroup( 1000,  'tbit',  ['pbit', 'petabit', 'petabits'], [2, 4, 5, 10], 'petabit', 'petabits' );
  uc.addGroup( 1000,  'pbit',  ['ebit', 'exabit', 'exabits'], [2, 4, 5, 10], 'exabit', 'exabits' );
  uc.addGroup( 1000,  'ebit',  ['zbit', 'zettabit', 'zettabits'], [2, 4, 5, 10], 'zettabit', 'zettabits' );
  uc.addGroup( 1000,  'zbit',  ['ybit', 'yottabit', 'yottabits'], [2, 4, 5, 10], 'yottabit', 'yottabits' );

  uc.addGroup( 1024,  'bit',   ['kibit', 'kibibit', 'kibibits'], [2, 4, 8, 16], 'kibibit', 'kibibits' );
  uc.addGroup( 1024,  'kibit', ['mibit', 'mebibit', 'mebibits'], [2, 4, 8, 16], 'mebibit', 'mebibits' );
  uc.addGroup( 1024,  'mibit', ['gibit', 'gibibit', 'gibibits'], [2, 4, 8, 16], 'gibibit', 'gibibits' );
  uc.addGroup( 1024,  'gibit', ['tibit', 'tebibit', 'tebibits'], [2, 4, 8, 16], 'tebibit', 'tebibits' );
  uc.addGroup( 1024,  'tibit', ['pibit', 'pebibit', 'pebibits'], [2, 4, 8, 16], 'pebibit', 'pebibits' );
  uc.addGroup( 1024,  'pibit', ['eibit', 'exbibit', 'exbibits'], [2, 4, 8, 16], 'exbibit', 'exbibits' );
  uc.addGroup( 1024,  'eibit', ['zibit', 'zebibit', 'zebibits'], [2, 4, 8, 16], 'zebibit', 'zebibits' );
  uc.addGroup( 1024,  'zibit', ['yibit', 'yobibit', 'yobibits'], [2, 4, 8, 16], 'yobibit', 'yobibits' );

  return uc;

})());


addClass((function generateLengthClass()
{
  var uc = new UnitzClass( 'Length' );

  uc.addGroup( 1,     null,   ['in', 'inch', 'inches', '"'], [2, 3, 4, 8, 16, 32], 'inch', 'inches' );
  uc.addGroup( 12,    'in',   ['ft', 'foot', 'feet', "'"], [2, 3, 4, 12], 'foot', 'feet' );
  uc.addGroup( 3,     'ft',   ['yd', 'yds', 'yard', 'yards'], [3], 'yard', 'yards' );
  uc.addGroup( 5280,  'ft',   ['mi', 'mile', 'miles'], [2, 3, 4, 5, 6, 7, 8, 9, 10], 'mile', 'miles' );
  uc.addGroup( 3,     'mi',   ['league', 'leagues'], [2, 3, 4, 5, 6, 7, 8, 9, 10], 'league', 'leagues' );

  uc.addGroup( 1,     null,   ['mm', 'millimeter', 'millimeters'], [10], 'millimeter', 'millimeters' );
  uc.addGroup( 10,    'mm',   ['cm', 'centimeter', 'centimeters'], [2, 4, 10], 'centimeter', 'centimeters' );
  uc.addGroup( 10,    'cm',   ['dc', 'decimeter', 'decimeters'], [10], 'decimeter', 'decimeters' );
  uc.addGroup( 100,   'cm',   ['m', 'meter', 'meters'], [2, 3, 4, 5, 10], 'meter', 'meters' );
  uc.addGroup( 1000,  'm',    ['km', 'kilometer', 'kilometers'], [2, 3, 4, 5, 6, 7, 8, 9, 10], 'kilometer', 'kilometers' );

  uc.addBaseConversion('in', 'mm', 25.4);

  return uc;

})());


addClass((function generateVolumeClass()
{
  var uc = new UnitzClass( 'Rotation' );

  uc.addGroup( 1,     null,    ['deg', 'degs', 'degree', 'degrees'], [], 'degree', 'degrees' );
  uc.addGroup( 1,     null,    ['rad', 'rads', 'radian', 'radians'], [], 'radian', 'radians' );

  uc.addBaseConversion( 'deg', 'rad', 0.0174533 );

  return uc;

})());


addClass((function generateTimeClass()
{
  var uc = new UnitzClass( 'Time' );

  uc.addGroup( 1,         null,     ['ns', 'nanosecond', 'nanoseconds', 'nano', 'nanos'], [10, 100], 'nanosecond', 'nanoseconds' );
  uc.addGroup( 1000,      'ns',     ['us', 'microsecond', 'microseconds', 'micros', 'micro'], [10, 100, 1000], 'microsecond', 'microseconds' );
  uc.addGroup( 1000,      'us',     ['ms', 'millisecond', 'milliseconds', 'millis'], [10, 100, 1000], 'millisecond', 'milliseconds' );
  uc.addGroup( 1000,      'ms',     ['s', 'second', 'seconds', 'sec', 'secs'], [2, 10, 100, 1000], 'second', 'seconds' );
  uc.addGroup( 60,        's',      ['min', 'minute', 'minutes', 'mins'], [2, 3, 4, 60], 'minute', 'minutes' );
  uc.addGroup( 60,        'min',    ['hr', 'hour', 'hours', 'hrs'], [2, 3, 4, 60], 'hour', 'hours' );
  uc.addGroup( 24,        'hr',     ['day', 'days'], [2, 3, 4, 6, 24], 'day', 'days' );
  uc.addGroup( 7,         'day',    ['wk', 'week', 'weeks', 'wks'], [7], 'week', 'weeks' );
  uc.addGroup( 365.2425,  'day',    ['yr', 'year', 'years', 'yrs'], [2, 3, 4, 6, 12, 52], 'year', 'years' );

  return uc;

})());


addClass((function generateVolumeClass()
{
  var uc = new UnitzClass( 'Volume' );

  uc.addGroup( 1,     null,   ['tsp', 'ts', 'tsps', 'teaspoon', 'teaspoons'], [2, 3, 4], 'teaspoon', 'teaspoons' );
  uc.addGroup( 3,     'tsp',  ['tbsp', 'tbsps', 'tablespoon', 'tablespoons'], [2, 3, 4], 'tablespoon', 'tablespoons' );
  uc.addGroup( 6,     'tsp',  ['oz', 'ounce', 'ounces', 'fl-oz', 'fl oz', 'floz', 'fluid ounce', 'fl. oz.', 'oz. fl.', 'oz fl'], [2, 3, 6], 'fluid ounce', 'fluid ounces' );
  uc.addGroup( 8,     'oz',   ['c', 'cup', 'cups'], [2, 3, 4], 'cup', 'cups' );
  uc.addGroup( 2,     'c',    ['pt', 'pint', 'pints'], [2, 4, 8], 'pint', 'pints' );
  uc.addGroup( 4,     'c',    ['qt', 'quart', 'quarts'], [2, 4, 8], 'quart', 'quarts' );
  uc.addGroup( 4,     'qt',   ['gal', 'gallon', 'gallons'], [2, 4, 8, 16], 'gallon', 'gallons' );

  uc.addGroup( 1,     null,   ['ml', 'millilitre', 'millilitres', 'milliliter', 'milliliters'], [2, 10], 'milliliter', 'milliliters' );
  uc.addGroup( 10,    'ml',   ['cl', 'centilitre', 'centilitres', 'centiliter', 'centiliters'], [10], 'centiliter', 'centiliters' );
  uc.addGroup( 1000,  'ml',   ['l', 'litre', 'litres', 'liter', 'liters'], [2, 3, 4, 10], 'liter', 'liters' );
  uc.addGroup( 10,    'l',    ['dl', 'decalitre', 'decalitres', 'decaliter', 'decaliters'], [10, 100], 'decaliter', 'decaliters' );
  uc.addGroup( 1000,  'l',    ['kl', 'kilolitre', 'kilolitres', 'kiloliter', 'kiloliters'], [10, 100], 'kiloliter', 'kiloliters' );

  uc.addGroup( 1,     null,   ['mm3', 'mm^3', 'cubic mm', 'cubic millimeter', 'cubic millimeters'], [2, 4, 8], 'cubic millimeter', 'cubic millimeters' );
  uc.addGroup( 1000,  'mm3',  ['cm3', 'cm^3', 'cubiccmm', 'cubic centimeter', 'cubic centimeters'], [2, 4, 8], 'cubic centimeter', 'cubic centimeters' );
  uc.addGroup( 1000000, 'cm3', ['m3', 'm^3', 'cubic m', 'cubic meter', 'cubic meters'], [2, 4, 8], 'cubic meter', 'cubic meters' );
  uc.addGroup( 1000000000, 'm3', ['km3', 'km^3', 'cubic km', 'meter', 'meters'], [2, 4, 8], 'meter', 'meters' );

  uc.addGroup( 1,     null,   ['in3', 'in^3', 'cubic in', 'cubic inch', 'cubic inches'], [2, 4, 8], 'cubic inch', 'cubic inches' );
  uc.addGroup( 1728,  'in3',  ['ft3', 'ft^3', 'cubic ft', 'cubic foot', 'cubic feet'], [2, 4, 8], 'cubic foot', 'cubic feet' );
  uc.addGroup( 27,    'ft3',  ['yd3', 'yd^3', 'cubic yd', 'cubic yard', 'cubic yards'], [2, 4, 8], 'cubic yard', 'cubic yards' );

  uc.addBaseConversion( 'tsp', 'ml', 4.92892 );
  uc.addBaseConversion( 'ml', 'mm3', 1 );
  uc.addBaseConversion( 'tsp', 'in3', 0.300781 );

  return uc;

})());


addClass((function generateWeightClass()
{
  var uc = new UnitzClass( 'Weight' );

  uc.addGroup( 1,       null,     ['mg', 'milligram', 'milligrams'], [2, 10], 'milligram', 'milligrams' );
  uc.addGroup( 1000,    'mg',     ['g', 'gram', 'grams'], [2, 10, 100], 'gram', 'grams' );
  uc.addGroup( 1000,    'g',      ['kg', 'kilogram', 'kilograms', 'kilo', 'kilos'], [2, 10, 100], 'kilogram', 'kilograms' );

  uc.addGroup( 1,       null,     ['oz', 'ounce', 'ounces'], [2, 3, 4, 16], 'ounce', 'ounces' );
  uc.addGroup( 16,      'oz',     ['lb', 'lbs', 'pound', 'pounds'], [2, 3, 4, 16], 'pound', 'pounds' );
  uc.addGroup( 2000,    'lb',     ['ton', 'tons', 'tonnes'], [2, 3, 4, 10], 'ton', 'tons' );

  uc.addBaseConversion( 'mg', 'oz', 0.000035274 );

  return uc;

})());


  Unitz.classes = classes;
  Unitz.classMap = classMap;
  Unitz.unitToClass = unitToClass;
  Unitz.regex = /^\s*(-?\d*)(\s+(\d+))?(\/(\d+)|\.(\d+)|)\s*(.*)\s*$/i;
  Unitz.epsilon = 0.001;
  Unitz.separator = ',';
  Unitz.separatorJoin = ', ';
  Unitz.heuristicLength = 3;

  Unitz.parse = parse;
  Unitz.parseInput = parseInput;
  Unitz.convert = convert;
  Unitz.best = best;
  Unitz.splitInput = splitInput;
  Unitz.combine = combine;
  Unitz.subtract = subtract;
  Unitz.compound = compound;
  Unitz.isHeuristicMatch = isHeuristicMatch;
  Unitz.conversions = conversions;
  Unitz.isSingular = isSingular;
  Unitz.isWhole = isWhole;
  Unitz.findUnit = findUnit;
  Unitz.addClass = addClass;
  Unitz.removeUnit = removeUnit;
  Unitz.removeGroup = removeGroup;

  Unitz.Class = UnitzClass;
  Unitz.Group = UnitzGroup;
  Unitz.Parsed = UnitzParsed;
  Unitz.Fraction = UnitzFraction;

  return Unitz;

}));
