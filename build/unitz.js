/* unitz 1.0.0 - A unit parser, converter, & combiner in JS by Philip Diffenderfer */
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


var Unitz =
{

  classes: [],

  classMap: {},

  units: {},

  regex: /^\s*(\d*)(\/(\d+)|\.(\d+)|)\s*(.*)\s*$/i,

  epsilon: 0.0001,

  separator: ',',

  parse: function(input)
  {
    var group = this.regex.exec( input );
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
        value += 1.0 / parseInt( decimal );
      }
    }

    var parsed = {
      value: value,
      unit: unit,
      normal: input,
      unitClass: this.units[ unit ],
      convert: this.convertThis
    };

    if ( parsed.unitClass )
    {
      var group = parsed.unitClass.groupMap[ unit ];

      parsed.normal = this.isOne( value ) ?
        ( value + ' ' + group.singular ) :
        ( value + ' ' + group.plural );
    }

    return parsed;
  },

  convertThis: function(to, fraction, largestDenominator, classlessDenominators)
  {
    var converted = Unitz.convert( this, to );

    if ( converted !== false && fraction )
    {
      var denominators = this.unitClass ? this.unitClass.groupMap[ this.unit ].denominators : classlessDenominators;

      if ( isArray( denominators ) )
      {
        converted = Unitz.toFraction( converted, denominators, largestDenominator );
      }
    }

    return converted;
  },

  convert: function(input, unit)
  {
    var parsed = this.parseInput( input );

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
  },

  combine: function(inputA, inputB)
  {
    var splitA = isString( inputA ) ? inputA.split( this.separator ) : [ inputA ];
    var splitB = isString( inputB ) ? inputB.split( this.separator ) : [ inputB ];
    var splitBoth = splitA.concat( splitB );
    var parsed = [];

    for (var i = 0; i < splitBoth.length; i++)
    {
      var parsedInput = this.parseInput( splitBoth[ i ] );

      if ( parsedInput !== false )
      {
        parsed.push( parsedInput );
      }
    }

    // TODO
  },

  parseInput: function(input)
  {
    if ( isString( input ) )
    {
      return this.parse( input );
    }
    if ( isObject( input ) )
    {
      return input;
    }
    if ( isNumber( input ) )
    {
      return {
        value: input,
        unit: '',
        unitClass: null,
        convert: this.convertThis
      };
    }

    return false;
  },

  conversions: function(input, largestDenominator)
  {
    var parsed = this.parseInput( input );

    if ( !isObject( parsed ) || !parsed.unitClass )
    {
      return input;
    }

    var groups = parsed.unitClass.groups;
    var conversions = parsed.conversions = [];

    for (var i = 0; i < groups.length; i++)
    {
      var grp = groups[ i ];

      if ( grp.unit === parsed.unit )
      {
        continue;
      }

      var converted = parsed.convert( grp.unit );
      var fraction = this.toFraction( converted, grp.denominators, largestDenominator );
      var isOne = this.isOne( converted );

      conversions.push(
      {
        decimal: converted,
        fraction: fraction,
        short: grp.unit,
        long: isOne ? grp.singular : grp.plural,
        group: grp
      });
    }

    return parsed;
  },

  isOne: function(x)
  {
    return Math.abs( x - 1 ) < this.epsilon;
  },

  toFraction: function(value, denominators, largestDenominator)
  {
    var distance = Math.abs( Math.floor( value ) - value );
    var denominator = 1;
    var numerator = value;

    for (var i = 0; i < denominators.length && distance > this.epsilon; i++)
    {
      var den = denominators[ i ];

      if ( largestDenominator && den > largestDenominator )
      {
        break;
      }

      var num = Math.round( value * den );
      var dis = Math.abs( Math.floor( num / den ) - value );

      if ( dis - this.epsilon < distance )
      {
        denominator = den;
        numerator = num;
        distance = dis;
      }
    }

    if ( denominator === 1 )
    {
      return numerator;
    }

    var whole = Math.floor( numerator / denominator );
    var remainder = Math.round( value - whole ) * denominator;

    var fraction = {
      numerator: numerator,
      denominator: denominator,
      remainder: remainder,
      whole: whole,
      string: whole === 0 ? (  numerator + '/' + denominator ) : ( whole + ' ' + remainder + '/' + denominator )
    };

    return fraction;
  },

  addClass: function(unitClass)
  {
    this.classMap[ unitClass.className ] = unitClass;
    this.classes.push( unitClass );

    for (var unit in unitClass.converters)
    {
      this.units[ unit ] = unitClass;
    }
  }

};


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

    var group = {
      unit: mainUnit,
      units: units,
      singular: singular,
      plural: plural,
      denominators: denominators
    };

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


Unitz.addClass((function generateLengthClass()
{
  var uc = new UnitzClass( 'Length' );

  uc.addGroup( 1,     null,   ['in', 'inch', 'inches', '"'], [2, 3, 4, 8, 16, 32], 'inch', 'inches' );
  uc.addGroup( 12,    'in',   ['ft', 'foot', 'feet', "'"], [2, 3, 4, 12], 'foot', 'feet' );
  uc.addGroup( 3,     'ft',   ['yd', 'yard', 'yards'], [3], 'yard', 'yards' );
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


Unitz.addClass((function generateTimeClass()
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


Unitz.addClass((function generateVolumeClass()
{
  var uc = new UnitzClass( 'Volume' );

  uc.addGroup( 1,     null,   ['tsp', 'ts', 'tsps', 'teaspoon', 'teaspoons'], [2, 3, 4], 'teaspoon', 'teaspoons' );
  uc.addGroup( 3,     'tsp',  ['tbsp', 'tbsps', 'tablespoon', 'tablespoons'], [2, 3, 4], 'tablespoon', 'tablespoons' );
  uc.addGroup( 6,     'tsp',  ['oz', 'ounce', 'ounces', 'fl-oz', 'fl oz', 'floz', 'fluid ounce', 'fl. oz.', 'oz. fl.', 'oz fl'], [2, 3, 6], 'fluid ounce', 'fluid ounces' );
  uc.addGroup( 8,     'oz',   ['c', 'cup', 'cups'], [2, 3, 4], 'cup', 'cups' );
  uc.addGroup( 2,     'c',    ['pt', 'pint', 'pints'], [2, 4], 'pint', 'pints' );
  uc.addGroup( 4,     'c',    ['qt', 'quart', 'quarts'], [2, 4], 'quart', 'quarts' );
  uc.addGroup( 4,     'qt',   ['gal', 'gallon', 'gallons'], [2, 4, 8, 16], 'gallon', 'gallons' );

  uc.addGroup( 1,     null,   ['ml', 'millilitre', 'millilitres'], [2, 10], 'millilitre', 'millilitres' );
  uc.addGroup( 1000,  'ml',   ['l', 'litre', 'litres'], [2, 10], 'litre', 'litres' );

  uc.addGroup( 1,     null,   ['mm3', 'mm^3', 'cubic mm', 'cubic millimeter', 'cubic millimeters'], [2, 4, 8], 'cubic millimeter', 'cubic millimeters' );
  uc.addGroup( 100,   'mm3',  ['cm3', 'cm^3', 'cubiccmm', 'cubic centimeter', 'cubic centimeters'], [2, 4, 8], 'cubic centimeter', 'cubic centimeters' );
  uc.addGroup( 10000, 'cm3',  ['m3', 'm^3', 'cubic m', 'cubic meter', 'cubic meters'], [2, 4, 8], 'cubic meter', 'cubic meters' );
  uc.addGroup( 1000000, 'm3', ['km3', 'km^3', 'cubic km', 'meter', 'meters'], [2, 4, 8], 'meter', 'meters' );

  uc.addGroup( 1,     null,   ['in3', 'in^3', 'cubic in', 'cubic inch', 'cubic inches'], [2, 4, 8], 'cubic inch', 'cubic inches' );
  uc.addGroup( 144,   'in3',  ['ft3', 'ft^3', 'cubic ft', 'cubic foot', 'cubic feet'], [2, 4, 8], 'cubic foot', 'cubic feet' );
  uc.addGroup( 27,    'ft3',  ['yd3', 'yd^3', 'cubic yd', 'cubic yard', 'cubic yards'], [2, 4, 8], 'cubic yard', 'cubic yards' );

  uc.addBaseConversion( 'tsp', 'ml', 4.92892 );
  uc.addBaseConversion( 'ml', 'mm3', 1 );
  uc.addBaseConversion( 'tsp', 'in3', 0.300781 );

  return uc;

})());


Unitz.addClass((function generateWeightClass()
{
  var uc = new UnitzClass( 'Weight' );

  uc.addGroup( 1,       null,     ['mg', 'milligram', 'milligrams'], [2, 10], 'milligram', 'milligrams' );
  uc.addGroup( 1000,    'mg',     ['g', 'gram', 'grams'], [2, 10, 100], 'gram', 'grams' );
  uc.addGroup( 1000,    'g',      ['kg', 'kilogram', 'kilograms', 'kilo', 'kilos'], [2, 10, 100], 'kilogram', 'kilograms' );

  uc.addGroup( 1,       null,     ['oz', 'ounce', 'ounces'], [2, 3, 4, 10], 'ounce', 'ounces' );
  uc.addGroup( 16,      'oz',     ['lb', 'lbs', 'pound', 'pounds'], [2, 3, 4, 16], 'pound', 'pounds' );
  uc.addGroup( 2000,    'lb',     ['ton', 'tons', 'tonnes'], [2, 3, 4, 10], 'ton', 'tons' );

  uc.addBaseConversion( 'mg', 'oz', 0.000035274 );

  return uc;

})());


  global.Unitz = Unitz;

})( this );
