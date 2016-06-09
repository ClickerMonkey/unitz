module( 'Unitz' );

test( 'simple', function(assert)
{
  strictEqual( Unitz.parse('2c').convert('tbsp'), 32 );
});
