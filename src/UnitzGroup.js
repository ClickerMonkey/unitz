
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
