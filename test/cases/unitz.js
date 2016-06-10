module( 'Unitz' );

test( 'parse and convert', function(assert)
{
  strictEqual( Unitz.parse('2c').convert('tbsp'), 32 );
  strictEqual( Unitz.parse('-2c').convert('tbsp'), -32 );
  strictEqual( Unitz.parse('12in').convert('ft'), 1 );
  strictEqual( Unitz.parse('-12in').convert('ft'), -1 );
  strictEqual( Unitz.parse('4 tbsp').convert('c', true).string, '1/4' );
  strictEqual( Unitz.parse('-4 tbsp').convert('c', true).string, '-1/4' );
  strictEqual( Unitz.parse('4 tbsp').convert('cup', true, true).string, '1/4 cup' );
  strictEqual( Unitz.parse('-4 tbsp').convert('cup', true, true).string, '-1/4 cup' );
  strictEqual( Unitz.parse('12 cm').convert('m', true).string, '1/10' );
  strictEqual( Unitz.parse('-12 cm').convert('m', true).string, '-1/10' );
  strictEqual( Unitz.parse('1/4 cup').convert('tbsp'), 4 );
  strictEqual( Unitz.parse('0.25c').convert('tbsp'), 4 );
  strictEqual( Unitz.parse('2 min').convert('s'), 120 );
  strictEqual( Unitz.parse('13oz').convert('lb', true).string, '13/16' );
  strictEqual( Unitz.parse('72 square inches').convert('sqft'), 0.5 );
  strictEqual( Unitz.parse('-72 square inches').convert('sqft'), -0.5 );
});

test( 'parse and best', function(assert)
{
  strictEqual( Unitz.parse('2c').best().normal, '1 pint' );
  strictEqual( Unitz.parse('-2c').best().normal, '-1 pint' );
  strictEqual( Unitz.parse('12in').best().normal, '1 foot' );
  strictEqual( Unitz.parse('4 tbsp').best().normal, '2 fluid ounces' );
  strictEqual( Unitz.parse('1/4 cup').best().normal, '2 fluid ounces' );
  strictEqual( Unitz.parse('2 min').best().normal, '2 minutes' );
  strictEqual( Unitz.parse('13/16lbs').best().normal, '13 ounces' );
  strictEqual( Unitz.parse('-13/16lbs').best().normal, '-13 ounces' );
});

test( 'best', function(assert)
{
  strictEqual( Unitz.best('0.5qt').normal, '1 pint' );
  strictEqual( Unitz.best('1.5ft').normal, '18 inches' );
  strictEqual( Unitz.best('-1.5ft').normal, '-18 inches' );
});

test( 'combine', function(assert)
{
  strictEqual( Unitz.combine( '1 cup', '2 cups' ), '3 cups' );
  strictEqual( Unitz.combine( '1 loaf', '2 loaves' ), '3 loaves' ); // heuristic matching
  strictEqual( Unitz.combine( '2, 3, 4', '1 taco' ), '10 taco' );
  strictEqual( Unitz.combine( '2, 3 tacos, 4', '1 taco' ), '10 tacos' );
  strictEqual( Unitz.combine( '1 pint', '2 cup' ), '1 quart' );
  strictEqual( Unitz.combine( '2 bags, 2 cup', '1 pint, 1 bag' ), '3 bags, 1 quart' );
});

test( 'subtract', function(assert)
{
  strictEqual( Unitz.subtract( '1 cup', '2 cups' ), '' );
  strictEqual( Unitz.subtract( '1 loaf', '2 loaves', true ), '-1 loaf' ); // heuristic matching
  strictEqual( Unitz.subtract( '1 pint', 'cup' ), '1 cup' );
  strictEqual( Unitz.subtract( '2 bags, 3 cup', '1 pint, 1 bag' ), '1 bag, 1 cup' );
});

test( 'conversions simple', function(assert)
{
  var conversions = Unitz.conversions('2.25 hrs').conversions;

  strictEqual( conversions[4].longNormal, '135 minutes' );
  strictEqual( conversions[5].longNormal, '2 1/4 hours' );
});

test( 'conversions range', function(assert)
{
  var conversions = Unitz.conversions('2.25 hrs', false, 0.1, 1000).conversions;

  strictEqual( conversions.length, 2 );
  strictEqual( conversions[0].longNormal, '135 minutes' );
  strictEqual( conversions[1].longNormal, '2 1/4 hours' );
});

test( 'conversions volume', function(assert)
{
  var conversions = Unitz.conversions('1/4c', false, 0.1, 10).conversions;

  strictEqual( conversions.length, 5 );
  strictEqual( conversions[0].longNormal, '4 tablespoons' );
  strictEqual( conversions[1].longNormal, '2 fluid ounces' );
  strictEqual( conversions[2].longNormal, '1/4 cups' );
  strictEqual( conversions[3].longNormal, '1/8 pints' );
  strictEqual( conversions[4].longNormal, '3 5/8 cubic inches' );
});

test( 'toFraction', function(assert)
{
  strictEqual( new Unitz.Fraction( 1 / 3, [2, 3, 6, 12] ).string, '1/3' );
  strictEqual( new Unitz.Fraction( 1 / 3, [2, 6, 12] ).string, '2/6' );
  strictEqual( new Unitz.Fraction( 5 / 3, [2, 3] ).string, '1 2/3' );
  strictEqual( new Unitz.Fraction( 4, [2, 4, 8, 16] ).string, 4 );
  strictEqual( new Unitz.Fraction( 1 / 8, [2, 3, 4, 5, 6, 7, 8] ).string, '1/8' );
  strictEqual( new Unitz.Fraction( 1 / 8, [2, 3, 4, 5, 6, 7, 8], 6 ).string, '1/6' );
  strictEqual( new Unitz.Fraction( 1 / 100, [2, 3, 4] ).string, 0.01 );
});

test( 'isOne', function(assert)
{
  ok( Unitz.isOne( 1 ) );
  ok( Unitz.isOne( 1.000001 ) );
  ok( Unitz.isOne( 0.999999 ) );
  notOk( Unitz.isOne( 1.01 ) );
  notOk( Unitz.isOne( 0.99 ) );
});
