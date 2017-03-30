
/**
 * Instantiates a new class instance with a name. A class stores information on
 * how to convert values between units, the set of valid strings to denote a
 * unit group, the singular and plural versions of a unit, and the valid
 * fraction denominators for that unit.
 *
 * @memberof Unitz
 * @alias Class
 * @class
 * @constructor
 * @param {String} className -
 *    The name of the class.
 */
function UnitzClass(className)
{
  /**
   * The name of the class.
   *
   * @member {String}
   */
  this.className = className;

  /**
   * The map of numbers it takes to get from one unit to another.
   *
   * @member {Object}
   */
  this.converters = {};

  /**
   * The map of numbers it takes to get from one base unit to another base unit.
   * There can be multiple systems in a single class (like Imperial vs Metric)
   * and when conversion takes place in {@link Unitz.convert} from one system
   * to another this map is used.
   *
   * @member {Object}
   */
  this.mapping = {};

  /**
   * A map of unit aliases to their base unit.
   *
   * @member {Object}
   */
  this.bases = {};

  /**
   * The array of groups in this class.
   *
   * @member {Unitz.Group[]}
   */
  this.groups = [];

  /**
   * The map of unit aliases to their group.
   *
   * @member {Object}
   */
  this.groupMap = {};
}

UnitzClass.prototype =
{

  /**
   * Adds a unit group to this class. A unit group is a unit relative to another
   * unit and has it's own aliases for the unit, singluar & plural
   * representations, and denominators to make unit-friendly fractions. The
   * group added to this class is returned.
   *
   * @method
   * @memberof Unitz.Class#
   * @param {Number} relativeValue -
   *    The value to scale by to get from the `relativeTo` unit to this unit
   *    group. If this is a base unit then this value should be 1 and the
   *    `relativeTo` should be not given.
   * @param {String} relativeTo -
   *    The unit the unit group being added is relative to. This should not be
   *    given when defining a base unit.
   * @param {String[]} units -
   *    The aliases for the unit group being added, each are valid ways to
   *    represent this group. These MUST be in lowercase form.
   * @param {Number[]} denominators -
   *    The denominators that are valid for the group being added. This is used
   *    so you don't see odd fractions that don't make sense for the given unit.
   * @param {String} singular -
   *    The singular unit (when a |value| is 1) to use for the added group.
   * @param {String} plural -
   *    The plural unit (when a |value| is not 1) to use for the added group.
   * @return {Unitz.Group} -
   *    The unit group added to this class.
   */
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

    return group;
  },

  /**
   * Removes a unit from this class. The group the unit to still exists in this
   * class, but the unit won't be parsed to the group anymore.
   *
   * @method
   * @memberof Unitz.Class#
   * @param {String} unit -
   *    The lowercase unit to remove from this class.
   * @return {Boolean} -
   *    True if the unit was removed, false if it does not exist in this class.
   */
  removeUnit: function(unit)
  {
    var exists = unit in this.converters;

    delete this.converters[ unit ];
    delete this.bases[ unit ];
    delete this.groupMap[ unit ];
    delete unitToClass[ unit ];

    return exists;
  },

  /**
   * Removes the group which has the given unit. The group will be removed
   * entirely from the system and can no longer be parsed or converted to and
   * from.
   *
   * @method
   * @memberof Unitz.Class#
   * @param {String} unit -
   *    The lowercase unit of the group to remove.
   * @return {Boolean} -
   *    True if the group was removed, false if it does not exist in this class.
   */
  removeGroup: function(unit)
  {
    var group = this.groupMap[ unit ];
    var removed = false;

    if ( group )
    {
      var units = group.units;

      for (var i = 0; i < units.length; i++)
      {
        var unit = units[ i ];

        if ( this.groupMap[ unit ] === group )
        {
          delete this.converters[ unit ];
          delete this.bases[ unit ];
          delete this.groupMap[ unit ];
          delete unitToClass[ unit ];
        }
      }

      var index = this.groups.indexOf( group );

      if ( index !== -1 )
      {
        this.groups.splice( index, 1 );

        removed = true;
      }
    }

    return removed;
  },

  /**
   * Adds a one direction conversion from one base unit to another.
   *
   * @method
   * @memberof Unitz.Class#
   * @param {String} source -
   *    The source unit.
   * @param {String} target -
   *    The target unit.
   * @param {Number} value -
   *    The value the source number needs to be multiplied by to get to the
   *    target value.
   * @see Unitz.Class#addBaseConversion
   */
  addOneBaseConversion: function(source, target, value)
  {
    if ( !(source in this.mapping) )
    {
      this.mapping[ source ] = {};
    }

    this.mapping[ source ][ target ] = value;
  },

  /**
   * Adds a bi-directional conversion from one base unit to another.
   *
   * ```javascript
   * uc.addBaseConversion( 'in', 'cm', 2.54 ); // 1 in to 2.54 cm
   * ```
   *
   * @method
   * @memberof Unitz.Class#
   * @param {String} source -
   *    The source unit.
   * @param {String} target -
   *    The target unit.
   * @param {Number} value -
   *    The value the source number needs to be multiplied by to get to the
   *    target value.
   * @see Unitz.Class#addBaseConversion
   */
  addBaseConversion: function(source, target, value)
  {
    this.addOneBaseConversion( source, target, value );
    this.addOneBaseConversion( target, source, 1.0 / value );
  }

};
