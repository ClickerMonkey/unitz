
addClass((function generateVolumeClass()
{
  var uc = new UnitzClass( 'Rotation' );

  uc.addGroup( 1,     null,    ['deg', 'degree', 'degrees'], [], 'degree', 'degrees' );
  uc.addGroup( 1,     null,    ['rad', 'radian', 'radians'], [], 'radian', 'radians' );

  uc.addBaseConversion( 'deg', 'rad', 0.0174533 );

  return uc;

})());
