
Unitz.addClass((function generateLengthClass()
{
  var uc = new UnitzClass( 'Length' );

  uc.addGroup( 1,     null,   ['in', 'inch', 'inches', '"'], [2, 3, 4, 8, 16, 32], 'inch', 'inches' );
  uc.addGroup( 12,    'in',   ['ft', 'foot', 'feet', "'"], [2, 3, 4, 12], 'foot', 'feet' );
  uc.addGroup( 3,     'ft',   ['yd', 'yard', 'yards'], [3], 'yard', 'yards' );
  uc.addGroup( 5280,  'ft',   ['mi', 'mile', 'miles'], [2, 3, 4, 5, 6, 7, 8, 9, 10], 'mile', 'miles' );
  uc.addGroup( 3,     'mi',   ['league', 'leagues'], [2, 3, 4, 5, 6, 7, 8, 9, 10], 'league', 'leagues' );

  uc.addGroup( 1,     null,   ['mm', 'millimeter', 'millimeters'], [10], 'millimeter', 'millimeters' );
  uc.addGroup( 10,    'mm',   ['cm', 'centimeter', 'centimeters'], [2, 4, 10], 'centimeter', 'centimeters' );
  uc.addGroup( 10,    'cm',   ['dc', 'decimeter', 'decimeters'], [10], 'decimeter', 'decimeters' );
  uc.addGroup( 100,   'cm',   ['m', 'meter', 'meters'], [2, 3, 4, 5, 10], 'meter', 'meters' );
  uc.addGroup( 1000,  'm',    ['km', 'kilometer', 'kilometers'], [2, 3, 4, 5, 6, 7, 8, 9, 10], 'kilometer', 'kilometers' );

  uc.addBaseConversion('in', 'mm', 25.4);

  return uc;

})());
