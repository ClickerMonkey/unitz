
Unitz.addClass((function generateWeightClass()
{
  var uc = new UnitzClass( 'Weight' );

  uc.addGroup( 1,       null,     ['mg', 'milligram', 'milligrams'], [2, 10], 'milligram', 'milligrams' );
  uc.addGroup( 1000,    'mg',     ['g', 'gram', 'grams'], [2, 10, 100], 'gram', 'grams' );
  uc.addGroup( 1000,    'g',      ['kg', 'kilogram', 'kilograms', 'kilo', 'kilos'], [2, 10, 100], 'kilogram', 'kilograms' );

  uc.addGroup( 1,       null,     ['oz', 'ounce', 'ounces'], [2, 3, 4, 10], 'ounce', 'ounces' );
  uc.addGroup( 16,      'oz',     ['lb', 'lbs', 'pound', 'pounds'], [2, 3, 4, 16], 'pound', 'pounds' );
  uc.addGroup( 2000,    'lb',     ['ton', 'tons', 'tonnes'], [2, 3, 4, 10], 'ton', 'tons' );

  uc.addBaseConversion( 'mg', 'oz', 0.000035274 );

  return uc;

})());
