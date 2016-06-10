
function UnitzConversion(converted, fraction, group)
{
  this.decimal = converted;
  this.fraction = fraction;
  this.shortUnit = group.unit;
  this.longUnit = isOne( converted ) ? group.singular : group.plural;
  this.group = group;
  this.friendly = fraction.valid ? fraction.string : converted;
  this.shortNormal = createNormal( this.friendly, this.shortUnit );
  this.longNormal = createNormal( this.friendly, this.longUnit );
}
