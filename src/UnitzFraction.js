
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
 */
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
  else
  {
    this.string = this.whole + ' ' + this.remainder + '/' + denominator;
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
