
addClass((function generateTimeClass()
{
  var uc = new UnitzClass( 'Time' );

  uc.addGroup( 1,         null,     ['ns', 'nanosecond', 'nanoseconds', 'nano', 'nanos'], [10, 100], 'nanosecond', 'nanoseconds' );
  uc.addGroup( 1000,      'ns',     ['us', 'microsecond', 'microseconds', 'micros', 'micro'], [10, 100, 1000], 'microsecond', 'microseconds' );
  uc.addGroup( 1000,      'us',     ['ms', 'millisecond', 'milliseconds', 'millis'], [10, 100, 1000], 'millisecond', 'milliseconds' );
  uc.addGroup( 1000,      'ms',     ['s', 'second', 'seconds', 'sec', 'secs'], [2, 10, 100, 1000], 'second', 'seconds' );
  uc.addGroup( 60,        's',      ['min', 'minute', 'minutes', 'mins'], [2, 3, 4, 60], 'minute', 'minutes' );
  uc.addGroup( 60,        'min',    ['hr', 'hour', 'hours', 'hrs'], [2, 3, 4, 60], 'hour', 'hours' );
  uc.addGroup( 24,        'hr',     ['day', 'days'], [2, 3, 4, 6, 24], 'day', 'days' );
  uc.addGroup( 7,         'day',    ['wk', 'week', 'weeks', 'wks'], [7], 'week', 'weeks' );
  uc.addGroup( 365.2425,  'day',    ['yr', 'year', 'years', 'yrs'], [2, 3, 4, 6, 12, 52], 'year', 'years' );

  return uc;

})());
