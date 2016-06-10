
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
