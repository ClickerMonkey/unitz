/* unitz 0.2.0 - A unit parser, converter, & combiner in JS by Philip Diffenderfer */
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

function isOne(x)
{
  return isNumber( x ) && Math.abs( x - 1 ) < Unitz.epsilon;
}

function isWhole(x)
{
  return isNumber( x ) && Math.abs( Math.floor( x ) - x ) < 0.00000001;
}

function isHeuristicMatch(unitA, unitB)
{
  return unitA.substring( 0, Unitz.heuristicLength ) === unitB.substring( 0, Unitz.heuristicLength );
}

function getHeuristicUnit(unitA, unitB, value)
{
  return unitA.length > unitB.length && !isOne( value ) ? unitA : unitB;
}

function createNormal(value, unit)
{
  return unit ? value + ' ' + unit : value;
}

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
  if ( isObject( input ) )
  {
    return [ input ];
  }

  return [];
}

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

function parse(input)
{
  var group = Unitz.regex.exec( input );
  var whole = group[1];
  var denom = group[3];
  var decimal = group[4];
  var unit = group[5].toLowerCase();

  if ( !whole && !decimal && !unit )
  {
    return false;
  }

  var value = 1;

  if ( whole )
  {
    value = parseInt( whole );

    if ( denom )
    {
      value /= parseInt( denom );
    }
    else if ( decimal )
    {
      value += parseFloat( '0.' + decimal );
    }
  }

  return new UnitzParsed( value, unit, units[ unit ], input );
}

function best(input, fraction, largestDenominator)
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

      if ( fraction.valid && (!closest || (fraction.distance < closest.distance) || fraction.denominator === 1) )
      {
        closest = fraction;
        closestGroup = grp;
      }
    }

    if ( closest )
    {
      parsed.value = closest.actual;
      parsed.unit = closestGroup.unit;
      parsed.group = closestGroup;
      parsed.normal = closestGroup.addUnit( closest ? closest.string : closest.actual );
    }
  }

  return parsed;
}

function convert(input, unit, fraction)
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

function combine(inputA, inputB, fraction, largestDenominator)
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
        a.normal = a.group.addUnit( a.value );
      }
      // "a" or "b" doesn't have a unit
      else if ( !a.unit || !b.unit )
      {
        parsed.splice( k, 1 );

        a.value += b.value;
        a.unit = a.unit || b.unit;
        a.normal = createNormal( a.value, a.unit );
      }
      // "a" and "b" have a similar enough unit.
      else if ( isHeuristicMatch( a.unit, b.unit ) )
      {
        parsed.splice( k, 1 );

        a.value += b.value;
        a.unit = getHeuristicUnit( a.unit, b.unit, a.value );
        a.normal = createNormal( a.value, a.unit );
      }
    }
  }

  var combined = [];

  for (var i = 0; i < parsed.length; i++)
  {
    var parsedBest = best( parsed[ i ], fraction, largestDenominator );

    if ( parsedBest && parsedBest.normal )
    {
      combined.push( parsedBest.normal );
    }
  }

  return combined.join( Unitz.separatorJoin );
}

function conversions(input, largestDenominator, min, max)
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

    var fraction = new UnitzFraction( converted, grp.denominators, largestDenominator );

    if ( isNumber( min ) && converted < min )
    {
      continue;
    }

    if ( isNumber( max ) && converted > max )
    {
      continue;
    }

    conversions.push(new UnitzConversion( converted, fraction, grp ));
  }

  return parsed;
}

function addClass(unitClass)
{
  classMap[ unitClass.className ] = unitClass;
  classes.push( unitClass );

  for (var unit in unitClass.converters)
  {
    units[ unit ] = unitClass;
  }
}


function UnitzClass(className)
{
  this.className = className;
  this.converters = {};
  this.mapping = {};
  this.bases = {};
  this.groups = [];
  this.groupMap = {};
}

UnitzClass.prototype =
{

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
  },

  addOneBaseConversion: function(source, target, value)
  {
    if ( !(source in this.mapping) )
    {
      this.mapping[ source ] = {};
    }

    this.mapping[ source ][ target ] = value;
  },

  addBaseConversion: function(source, target, value)
  {
    this.addOneBaseConversion( source, target, value );
    this.addOneBaseConversion( target, source, 1.0 / value );
  }

};


function UnitzGroup(mainUnit, baseUnit, baseScale, units, singular, plural, denominators)
{
  this.unit = mainUnit;
  this.baseUnit = baseUnit;
  this.baseScale = baseScale;
  this.units = units;
  this.singular = singular;
  this.plural = plural;
  this.denominators = denominators;
}

UnitzGroup.prototype =
{
  addUnit: function(x)
  {
    return createNormal( x, isOne( x ) ? this.singular : this.plural );
  }
};


function UnitzParsed(value, unit, unitClass, normal)
{
  this.value = value;
  this.unit = unit;
  this.unitClass = unitClass;
  this.group = unitClass ? unitClass.groupMap[ unit ] : null;
  this.normal = this.group ? this.group.addUnit( value ) : normal;
}

UnitzParsed.prototype =
{
  convert: function(to, fraction, withUnit, largestDenominator, classlessDenominators)
  {
    var converted = convert( this, to );

    if ( converted !== false && fraction )
    {
      var denominators = this.group ? this.group.denominators : classlessDenominators;

      if ( isArray( denominators ) )
      {
        converted = new UnitzFraction( converted, denominators, largestDenominator );

        if ( isObject( converted ) && withUnit && to )
        {
          converted.string = converted.string + ' ' + to;
        }
      }
    }

    if ( withUnit && isNumber( converted ) && to )
    {
      converted = converted + ' ' + to;
    }

    return converted;
  },

  best: function(fraction, largestDenominator)
  {
    return best( this, fraction, largestDenominator );
  }
};

UnitzParsed.fromNumber = function(number)
{
  return new UnitzParsed(number, '', null, number, null);
};

function UnitzFraction(value, denominators, largestDenominator)
{
  var distance = Math.abs( Math.floor( value ) - value );
  var denominator = 1;
  var numerator = value;

  for (var i = 0; i < denominators.length && distance > Unitz.epsilon; i++)
  {
    var den = denominators[ i ];
    var num = Math.round( value * den );
    var dis = Math.abs( num / den - value );

    if ( isNumber( largestDenominator ) && den > largestDenominator )
    {
      break;
    }

    if ( dis + Unitz.epsilon < distance )
    {
      denominator = den;
      numerator = num;
      distance = dis;
    }
  }

  this.numerator = numerator;
  this.denominator = denominator;
  this.actual = numerator / denominator;
  this.distance = distance;
  this.whole = Math.floor( this.actual );
  this.remainder = Math.round( (value - this.whole) * denominator );
  this.valid = denominator !== 1 || isWhole( numerator );
  this.string = '';

  if ( denominator === 1 )
  {
    this.string = numerator;
  }
  else if ( this.whole === 0 )
  {
    this.string = numerator + '/' + denominator;
  }
  else
  {
    this.string = this.whole + ' ' + this.remainder + '/' + denominator;
  }
}


function UnitzConversion(converted, fraction, group)
{
  this.decimal = converted;
  this.fraction = fraction;
  this.shortUnit = group.unit;
  this.longUnit = isOne( converted ) ? group.singular : group.plural;
  this.group = group;
  this.friendly = fraction.valid ? fraction.string : converted;
  this.shortNormal = createNormal( this.friendly, this.shortUnit );
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
  uc.addGroup( 4,     'bit',   ['nibble', 'nibbles'], [], 'nibble', 'nibbles' );
  uc.addGroup( 8,     'bit',   ['b', 'byte', 'bytes'], [2, 8], 'byte', 'bytes' );
  uc.addGroup( 1024,  'b',     ['kb', 'kilobyte', 'kilobytes'], [2, 4, 8, 16], 'kilobyte', 'kilobytes' );
  uc.addGroup( 1024,  'kb',    ['mb', 'megabyte', 'megabytes'], [2, 4, 8, 16], 'megabyte', 'megabytes' );
  uc.addGroup( 1024,  'mb',    ['gb', 'gigabyte', 'gigabytes'], [2, 4, 8, 16], 'gigabyte', 'gigabytes' );
  uc.addGroup( 1024,  'gb',    ['tb', 'terabyte', 'terabytes'], [2, 4, 8, 16], 'terabyte', 'terabytes' );
  uc.addGroup( 1024,  'tb',    ['pb', 'petabyte', 'petabytes'], [2, 4, 8, 16], 'petabyte', 'petabytes' );
  uc.addGroup( 1024,  'pb',    ['eb', 'exabyte', 'exabytes'], [2, 4, 8, 16], 'exabyte', 'exabytes' );
  uc.addGroup( 1024,  'bit',   ['kbit', 'kilobit', 'kilobits'], [2, 4, 8, 16], 'kilobit', 'kilobits' );
  uc.addGroup( 1024,  'kbit',  ['mbit', 'megabit', 'megabits'], [2, 4, 8, 16], 'megabit', 'megabits' );
  uc.addGroup( 1024,  'mbit',  ['gbit', 'gigabit', 'gigabits'], [2, 4, 8, 16], 'gigabit', 'gigabits' );
  uc.addGroup( 1024,  'gbit',  ['tbit', 'terabit', 'terabits'], [2, 4, 8, 16], 'terabit', 'terabits' );
  uc.addGroup( 1024,  'tbit',  ['pbit', 'petabit', 'petabits'], [2, 4, 8, 16], 'petabit', 'petabits' );
  uc.addGroup( 1024,  'pbit',  ['ebit', 'exabit', 'exabits'], [2, 4, 8, 16], 'exabit', 'exabits' );

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

  uc.addGroup( 1,     null,   ['ml', 'millilitre', 'millilitres'], [2, 10], 'millilitre', 'millilitres' );
  uc.addGroup( 1000,  'ml',   ['l', 'litre', 'litres'], [2, 10], 'litre', 'litres' );

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


  var Unitz = {};

  Unitz.classes = classes;
  Unitz.classMap = classMap;
  Unitz.units = units;
  Unitz.regex = /^\s*(\d*)(\/(\d+)|\.(\d+)|)\s*(.*)\s*$/i;
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
  Unitz.isHeuristicMatch = isHeuristicMatch;
  Unitz.getHeuristicUnit = getHeuristicUnit;
  Unitz.conversions = conversions;
  Unitz.isOne = isOne;
  Unitz.isWhole = isWhole;
  Unitz.addClass = addClass;

  Unitz.Class = UnitzClass;
  Unitz.Group = UnitzGroup;
  Unitz.Parsed = UnitzParsed;
  Unitz.Fraction = UnitzFraction;

  return Unitz;

}));
