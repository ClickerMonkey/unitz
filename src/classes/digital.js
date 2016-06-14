
addClass((function generateVolumeClass()
{
  var uc = new UnitzClass( 'Digital' );

  uc.addGroup( 1,     null,   ['bit', 'bits'], [], 'bit', 'bits' );
  uc.addGroup( 4,     'bit',   ['nibble', 'nibbles', 'nybble', 'nyble', 'half-byte', 'half byte', 'tetrade', 'semi-octet', 'quadbit', 'quartet'], [], 'nibble', 'nibbles' );
  uc.addGroup( 8,     'bit',   ['b', 'byte', 'bytes'], [2, 8], 'byte', 'bytes' );

  uc.addGroup( 1000,  'b',     ['kb', 'kilobyte', 'kilobytes'], [2, 4, 5, 10], 'kilobyte', 'kilobytes' );
  uc.addGroup( 1000,  'kb',    ['mb', 'megabyte', 'megabytes'], [2, 4, 5, 10], 'megabyte', 'megabytes' );
  uc.addGroup( 1000,  'mb',    ['gb', 'gigabyte', 'gigabytes'], [2, 4, 5, 10], 'gigabyte', 'gigabytes' );
  uc.addGroup( 1000,  'gb',    ['tb', 'terabyte', 'terabytes'], [2, 4, 5, 10], 'terabyte', 'terabytes' );
  uc.addGroup( 1000,  'tb',    ['pb', 'petabyte', 'petabytes'], [2, 4, 5, 10], 'petabyte', 'petabytes' );
  uc.addGroup( 1000,  'pb',    ['eb', 'exabyte', 'exabytes'], [2, 4, 5, 10], 'exabyte', 'exabytes' );
  uc.addGroup( 1000,  'eb',    ['zb', 'zettabyte', 'zettabytes'], [2, 4, 5, 10], 'zettabyte', 'zettabytes' );
  uc.addGroup( 1000,  'zb',    ['yb', 'yottabyte', 'yottabytes'], [2, 4, 5, 10], 'yottabyte', 'yottabytes' );

  uc.addGroup( 1024,  'b',     ['kib', 'kibibyte', 'kibibytes'], [2, 4, 8, 16], 'kibibyte', 'kibibytes' );
  uc.addGroup( 1024,  'kib',   ['mib', 'mebibyte', 'mebibytes'], [2, 4, 8, 16], 'mebibyte', 'mebibytes' );
  uc.addGroup( 1024,  'mib',   ['gib', 'gibibyte', 'gibibytes'], [2, 4, 8, 16], 'gibibyte', 'gibibytes' );
  uc.addGroup( 1024,  'gib',   ['tib', 'tebibyte', 'tebibytes'], [2, 4, 8, 16], 'tebibyte', 'tebibytes' );
  uc.addGroup( 1024,  'tib',   ['pib', 'pebibyte', 'pebibytes'], [2, 4, 8, 16], 'pebibyte', 'pebibytes' );
  uc.addGroup( 1024,  'pib',   ['eib', 'exbibyte', 'exbibytes'], [2, 4, 8, 16], 'exbibyte', 'exbibytes' );
  uc.addGroup( 1024,  'eib',   ['zib', 'zebibyte', 'zebibytes'], [2, 4, 8, 16], 'zebibyte', 'zebibytes' );
  uc.addGroup( 1024,  'zib',   ['yib', 'yobibyte', 'yobibytes'], [2, 4, 8, 16], 'yobibyte', 'yobibytes' );

  uc.addGroup( 1000,  'bit',   ['kbit', 'kilobit', 'kilobits'], [2, 4, 5, 10], 'kilobit', 'kilobits' );
  uc.addGroup( 1000,  'kbit',  ['mbit', 'megabit', 'megabits'], [2, 4, 5, 10], 'megabit', 'megabits' );
  uc.addGroup( 1000,  'mbit',  ['gbit', 'gigabit', 'gigabits'], [2, 4, 5, 10], 'gigabit', 'gigabits' );
  uc.addGroup( 1000,  'gbit',  ['tbit', 'terabit', 'terabits'], [2, 4, 5, 10], 'terabit', 'terabits' );
  uc.addGroup( 1000,  'tbit',  ['pbit', 'petabit', 'petabits'], [2, 4, 5, 10], 'petabit', 'petabits' );
  uc.addGroup( 1000,  'pbit',  ['ebit', 'exabit', 'exabits'], [2, 4, 5, 10], 'exabit', 'exabits' );
  uc.addGroup( 1000,  'ebit',  ['zbit', 'zettabit', 'zettabits'], [2, 4, 5, 10], 'zettabit', 'zettabits' );
  uc.addGroup( 1000,  'zbit',  ['ybit', 'yottabit', 'yottabits'], [2, 4, 5, 10], 'yottabit', 'yottabits' );

  uc.addGroup( 1024,  'bit',   ['kibit', 'kibibit', 'kibibits'], [2, 4, 8, 16], 'kibibit', 'kibibits' );
  uc.addGroup( 1024,  'kibit', ['mibit', 'mebibit', 'mebibits'], [2, 4, 8, 16], 'mebibit', 'mebibits' );
  uc.addGroup( 1024,  'mibit', ['gibit', 'gibibit', 'gibibits'], [2, 4, 8, 16], 'gibibit', 'gibibits' );
  uc.addGroup( 1024,  'gibit', ['tibit', 'tebibit', 'tebibits'], [2, 4, 8, 16], 'tebibit', 'tebibits' );
  uc.addGroup( 1024,  'tibit', ['pibit', 'pebibit', 'pebibits'], [2, 4, 8, 16], 'pebibit', 'pebibits' );
  uc.addGroup( 1024,  'pibit', ['eibit', 'exbibit', 'exbibits'], [2, 4, 8, 16], 'exbibit', 'exbibits' );
  uc.addGroup( 1024,  'eibit', ['zibit', 'zebibit', 'zebibits'], [2, 4, 8, 16], 'zebibit', 'zebibits' );
  uc.addGroup( 1024,  'zibit', ['yibit', 'yobibit', 'yobibits'], [2, 4, 8, 16], 'yobibit', 'yobibits' );

  return uc;

})());
