
Unitz.addClass((function generateVolumeClass()
{
  var uc = new UnitzClass( 'Volume' );

  uc.addGroup( 1,     null,   ['tsp', 'ts', 'tsps', 'teaspoon', 'teaspoons'], [2, 3, 4], 'teaspoon', 'teaspoons' );
  uc.addGroup( 3,     'tsp',  ['tbsp', 'tbsps', 'tablespoon', 'tablespoons'], [2, 3, 4], 'tablespoon', 'tablespoons' );
  uc.addGroup( 6,     'tsp',  ['oz', 'ounce', 'ounces', 'fl-oz', 'fl oz', 'floz', 'fluid ounce', 'fl. oz.', 'oz. fl.', 'oz fl'], [2, 3, 6], 'fluid ounce', 'fluid ounces' );
  uc.addGroup( 8,     'oz',   ['c', 'cup', 'cups'], [2, 3, 4], 'cup', 'cups' );
  uc.addGroup( 2,     'c',    ['pt', 'pint', 'pints'], [2, 4], 'pint', 'pints' );
  uc.addGroup( 4,     'c',    ['qt', 'quart', 'quarts'], [2, 4], 'quart', 'quarts' );
  uc.addGroup( 4,     'qt',   ['gal', 'gallon', 'gallons'], [2, 4, 8, 16], 'gallon', 'gallons' );

  uc.addGroup( 1,     null,   ['ml', 'millilitre', 'millilitres'], [2, 10], 'millilitre', 'millilitres' );
  uc.addGroup( 1000,  'ml',   ['l', 'litre', 'litres'], [2, 10], 'litre', 'litres' );

  uc.addGroup( 1,     null,   ['mm3', 'mm^3', 'cubic mm', 'cubic millimeter', 'cubic millimeters'], [2, 4, 8], 'cubic millimeter', 'cubic millimeters' );
  uc.addGroup( 100,   'mm3',  ['cm3', 'cm^3', 'cubiccmm', 'cubic centimeter', 'cubic centimeters'], [2, 4, 8], 'cubic centimeter', 'cubic centimeters' );
  uc.addGroup( 10000, 'cm3',  ['m3', 'm^3', 'cubic m', 'cubic meter', 'cubic meters'], [2, 4, 8], 'cubic meter', 'cubic meters' );
  uc.addGroup( 1000000, 'm3', ['km3', 'km^3', 'cubic km', 'meter', 'meters'], [2, 4, 8], 'meter', 'meters' );

  uc.addGroup( 1,     null,   ['in3', 'in^3', 'cubic in', 'cubic inch', 'cubic inches'], [2, 4, 8], 'cubic inch', 'cubic inches' );
  uc.addGroup( 144,   'in3',  ['ft3', 'ft^3', 'cubic ft', 'cubic foot', 'cubic feet'], [2, 4, 8], 'cubic foot', 'cubic feet' );
  uc.addGroup( 27,    'ft3',  ['yd3', 'yd^3', 'cubic yd', 'cubic yard', 'cubic yards'], [2, 4, 8], 'cubic yard', 'cubic yards' );

  uc.addBaseConversion( 'tsp', 'ml', 4.92892 );
  uc.addBaseConversion( 'ml', 'mm3', 1 );
  uc.addBaseConversion( 'tsp', 'in3', 0.300781 );

  return uc;

})());
