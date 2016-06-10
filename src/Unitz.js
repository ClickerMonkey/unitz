
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
  return isNumber( x ) && Math.abs( Math.abs( x ) - 1 ) < Unitz.epsilon;
}

function isWhole(x)
{
  return isNumber( x ) && Math.abs( Math.floor( x ) - x ) < 0.00000001;
}

function isHeuristicMatch(unitA, unitB)
{
  return unitA.substring( 0, Unitz.heuristicLength ) === unitB.substring( 0, Unitz.heuristicLength );
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
      a.normal = a.group.addUnit( a.value );
    }
    else
    {
      a.unit = findUnit( a.units, isOne( a.value ) );
      a.normal = createNormal( a.value, a.unit );
    }

    var parsedBest = best( a, fraction, largestDenominator );

    if ( parsedBest && parsedBest.normal )
    {
      combined.push( parsedBest.normal );
    }
  }

  return combined.join( Unitz.separatorJoin );
}

function subtract(inputA, inputB, allowNegatives, fraction, largestDenominator)
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

    if ( a.value < 0 && !allowNegatives )
    {
      continue;
    }

    if ( a.group )
    {
      a.normal = a.group.addUnit( a.value );
    }
    else
    {
      a.unit = findUnit( a.units, isOne( a.value ) );
      a.normal = createNormal( a.value, a.unit );
    }

    var parsedBest = best( a, fraction, largestDenominator );

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
