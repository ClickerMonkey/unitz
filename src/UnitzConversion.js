
/**
 * Instantiates a new conversion instance with a converted value, it's fraction
 * representation, and the unit group.
 *
 * @memberof Unitz
 * @alias Conversion
 * @class
 * @constructor
 * @param {Number} converted -
 *    The converted value as a number.
 * @param {Unitz.Fraction} fraction -
 *    The converted value as a fraction.
 * @param {Unitz.Group} group -
 *    The group for the unit of this conversion.
 * @see Unitz.conversions
 */
function UnitzConversion(converted, fraction, group)
{
  /**
   * The converted value.
   *
   * @member {Number}
   */
  this.decimal = converted;

  /**
   * The converted fraction.
   *
   * @member {Unitz.Fraction}
   */
  this.fraction = fraction;

  /**
   * The group of the converted value.
   *
   * @member {Unitz.Group}
   */
  this.group = group;

  /**
   * The short representation for the conversion unit. This doesn't change
   * depending on the singular/plural nature of the converted value.
   *
   * @member {String}
   */
  this.shortUnit = group.unit;

  /**
   * The long representation for the conversion unit. This depends on the
   * singular/plural nature of the converted value.
   *
   * @member {String}
   */
  this.longUnit = fraction.valid ? group.getUnit( fraction.isSingular() ) : group.getUnit( converted );

  /**
   * The friendly version of the converted value - either the
   * {@link Unitz.Fraction#string} value of the fraction is valid - or the
   * {@link Unitz.Conversion#decimal} value.
   *
   * @member {String|Number}
   */
  this.friendly = fraction.valid ? fraction.string : converted;

  /**
   * The friendly version of the converted value with the short unit appended.
   *
   * @member {String}
   */
  this.shortNormal = createNormal( this.friendly, this.shortUnit );

  /**
   * The friendly version of the converted value with the long unit appended.
   *
   * @member {String}
   */
  this.longNormal = createNormal( this.friendly, this.longUnit );

}
