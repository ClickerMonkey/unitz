
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
