
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
