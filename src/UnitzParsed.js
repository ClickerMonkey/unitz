
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
   * @see Unitz.Fraction
   * @return {Number|String|Unitz.Fraction|false}
   */
  convert: function(to, returnFraction, withUnit, largestDenominator, classlessDenominators)
  {
    var converted = convert( this, to );

    if ( converted !== false && returnFraction )
    {
      var denominators = this.group ? this.group.denominators : classlessDenominators;

      if ( isArray( denominators ) )
      {
        converted = new UnitzFraction( converted, denominators, largestDenominator );

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
   * @param {Number} [largestDenominator] -
   *    See {@link Unitz.Fraction}.
   * @see Unitz.best
   * @return {Unitz.Parsed}
   */
  best: function(returnFraction, largestDenominator)
  {
    return best( this, returnFraction, largestDenominator );
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
