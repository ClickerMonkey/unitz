
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
