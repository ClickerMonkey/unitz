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
