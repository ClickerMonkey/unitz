
addClass((function generateVolumeClass()
{
  var uc = new UnitzClass( 'Digital' );

  uc.addGroup( 1,     null,   ['bit', 'bits'], [], 'bit', 'bits' );
  uc.addGroup( 4,     'bit',   ['nibble', 'nibbles'], [], 'nibble', 'nibbles' );
  uc.addGroup( 8,     'bit',   ['b', 'byte', 'bytes'], [2, 8], 'byte', 'bytes' );
  uc.addGroup( 1024,  'b',     ['kb', 'kilobyte', 'kilobytes'], [2, 4, 8, 16], 'kilobyte', 'kilobytes' );
  uc.addGroup( 1024,  'kb',    ['mb', 'megabyte', 'megabytes'], [2, 4, 8, 16], 'megabyte', 'megabytes' );
  uc.addGroup( 1024,  'mb',    ['gb', 'gigabyte', 'gigabytes'], [2, 4, 8, 16], 'gigabyte', 'gigabytes' );
  uc.addGroup( 1024,  'gb',    ['tb', 'terabyte', 'terabytes'], [2, 4, 8, 16], 'terabyte', 'terabytes' );
  uc.addGroup( 1024,  'tb',    ['pb', 'petabyte', 'petabytes'], [2, 4, 8, 16], 'petabyte', 'petabytes' );
  uc.addGroup( 1024,  'pb',    ['eb', 'exabyte', 'exabytes'], [2, 4, 8, 16], 'exabyte', 'exabytes' );
  uc.addGroup( 1024,  'bit',   ['kbit', 'kilobit', 'kilobits'], [2, 4, 8, 16], 'kilobit', 'kilobits' );
  uc.addGroup( 1024,  'kbit',  ['mbit', 'megabit', 'megabits'], [2, 4, 8, 16], 'megabit', 'megabits' );
  uc.addGroup( 1024,  'mbit',  ['gbit', 'gigabit', 'gigabits'], [2, 4, 8, 16], 'gigabit', 'gigabits' );
  uc.addGroup( 1024,  'gbit',  ['tbit', 'terabit', 'terabits'], [2, 4, 8, 16], 'terabit', 'terabits' );
  uc.addGroup( 1024,  'tbit',  ['pbit', 'petabit', 'petabits'], [2, 4, 8, 16], 'petabit', 'petabits' );
  uc.addGroup( 1024,  'pbit',  ['ebit', 'exabit', 'exabits'], [2, 4, 8, 16], 'exabit', 'exabits' );

  return uc;

})());
