
function UnitzGroup(mainUnit, baseUnit, baseScale, units, singular, plural, denominators)
{
  this.unit = mainUnit;
  this.baseUnit = baseUnit;
  this.baseScale = baseScale;
  this.units = units;
  this.singular = singular;
  this.plural = plural;
  this.denominators = denominators;
}

UnitzGroup.prototype =
{
  addUnit: function(x)
  {
    return createNormal( x, isOne( x ) ? this.singular : this.plural );
  }
};
