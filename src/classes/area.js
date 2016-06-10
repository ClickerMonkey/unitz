
addClass((function generateVolumeClass()
{
  var uc = new UnitzClass( 'Area' );

  uc.addGroup( 1,     null,    ['sqin', 'sq. in.', 'sq in', 'in2', 'in^2', 'square inch', 'square inches'], [2, 4, 8, 16], 'square inch', 'square inches' );
  uc.addGroup( 144,   'sqin',  ['sqft', 'sq. ft.', 'sq ft', 'ft2', 'ft^2', 'square foot', 'square feet'], [2, 4, 8, 16], 'square foot', 'square feet' );
  uc.addGroup( 9,     'sqft',  ['sqyd', 'sq. yd.', 'sq yd', 'yd2', 'yd^2', 'square yard', 'square yards'], [2, 3, 4, 8, 9, 16], 'square yard', 'square yards' );
  uc.addGroup( 4840,  'sqyd',  ['acre', 'acres'], [2, 3, 4, 8, 10], 'acre', 'acres' );
  uc.addGroup( 640,   'acre',  ['sqmi', 'sq. mi.', 'sq mi', 'mi2', 'mi^2', 'square mile', 'square miles'], [2, 3, 4, 8, 10], 'square mile', 'square miles' );

  uc.addGroup( 1,     null,    ['sqmm', 'sq. mm.', 'sq mm', 'mm2', 'mm^2', 'square millimeter', 'square millimeters'], [2, 4, 8, 16], 'square millimeter', 'square millimeters' );
  uc.addGroup( 100,   'sqmm',  ['sqcm', 'sq. cm.', 'sq cm', 'cm2', 'cm^2', 'square centimeter', 'square centimeters'], [2, 4, 8, 16], 'square centimeter', 'square centimeters' );
  uc.addGroup( 10000, 'sqcm',  ['sqm', 'sq. m.', 'sq m', 'm2', 'm^2', 'square meter', 'square meters'], [2, 4, 8, 16], 'square meter', 'square meters' );
  uc.addGroup( 1000000, 'sqm', ['sqkm', 'sq. km.', 'sq km', 'km2', 'km^2', 'square kilometer', 'square kilometers'], [2, 3, 4, 8, 9, 16], 'square kilometer', 'square kilometers' );

  uc.addBaseConversion( 'sqin', 'sqmm', 645.16 );

  return uc;

})());
