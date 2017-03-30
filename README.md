# Unitz

[![Build Status](https://travis-ci.org/ClickerMonkey/unitz.svg?branch=master)](https://travis-ci.org/ClickerMonkey/unitz)
[![devDependency Status](https://david-dm.org/ClickerMonkey/unitz/dev-status.svg)](https://david-dm.org/ClickerMonkey/unitz#info=devDependencies)
[![Dependency Status](https://david-dm.org/ClickerMonkey/unitz.svg)](https://david-dm.org/ClickerMonkey/unitz)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/ClickerMonkey/unitz/blob/master/LICENSE)
[![Alpha](https://img.shields.io/badge/State-Alpha-orange.svg)]()

Unitz is a library designed to take in a quantity and unit provided by a user and perform addition, subtraction, conversion, and transformation to human friendly representations.
Unitz will attempt to handle conversions, additions, and subtractions even if the units aren't recognized.

### Documentation

http://clickermonkey.github.io/unitz/

### Installation

Install via `bower install unitz` or `npm install unitz`.

Several classes are implemented - you can even add your own:
- Area
- Digital
- Length
- Rotation
- Time
- Volume
- Weight

Further down this document provides a detailed list of all units supported.

### Examples

```javascript
// =============================================================================
// Unitz.parse( input )
// =============================================================================

// Valid numbers: 1, 1/2, 1 1/2, 3/2, 1.5, .5, -1 1/2, -1.5, -.5
Unitz.parse('2c'); /*{
  value: 2,
  unit: 'c',
  normal: '2 cups',
  unitClass: ... // Unitz.Class instance
  group: ... // Unitz.Group instance
}*/

// =============================================================================
// Unitz.parse( input ).convert( toUnit, returnFraction, withUnit, largestDenominator, classlessDenominators )
// =============================================================================

Unitz.parse('2c').convert('tbsp'); // 32
Unitz.parse('2 cup').convert('tbsp', false, true); // '32 tbsp'
Unitz.parse('4 tbsps').convert('cups', true); // {numerator: 1, denominator: 4, string: '1/4', remainder: 1, whole: 0, actual: 0.25, distance: 0, valid: true}
Unitz.parse('4 tbsps').convert('cups', true).string; // '1/4'
Unitz.parse('3 cups').convert('pint', true).string; // '1 1/2 pints'

// =============================================================================
// Unitz.parse( input ).best()
// Unitz.best( input )
// =============================================================================

Unitz.parse('2c').best().normal; // '1 pint'
Unitz.best('12in').normal; // '1 foot'
Unitz.best('1/4 cup').normal; // '2 fluid ounces'

// =============================================================================
// Unitz.compound( input, unitsAllowed )
// =============================================================================

Unitz.compound('2 cups', ['pt', 'c']); // '1 pt'
Unitz.compound('2 cups', ['c', 'tbsp']); // '2 c'
Unitz.compound('0.625 cups', ['c', 'tbsp', 'tsp']); // '1/2 c, 2 tbsp'
Unitz.compound('1.342 cups', ['c', 'tbsp', 'tsp']); // '1 c, 5 tbsp, 1 tsp'

// =============================================================================
// Unitz.combine( a, b, useFractions, largestDenominator )
// =============================================================================

Unitz.combine( '1 cup', '2 cups' ); // '3 cups'
Unitz.combine( '1 pint', '2 cup' ); // '1 quart'
Unitz.combine( '2 bags, 2 cup', '1 pint, 1 bag' ); // '3 bags, 1 quart'
// units that don't exist, but they look similar enough to intelligibly join (looks at first X characters) and intelligibly guess the correct singular/plural form.
Unitz.combine( '1 loaf', '2 loaves' ); // '3 loaves'
Unitz.combine( '2, 3, 4', '1 taco' ); // '10 taco'
Unitz.combine( '2, 3 tacos, 4', '1 taco' ); // '10 tacos'

// =============================================================================
// Unitz.subtract( a, b, allowNegatives, useFractions, largestDenominator )
// =============================================================================

Unitz.subtract( '2 bags, 3 pints', '1 bag, 1 quart' ); // '1 bag, 1 pint'

// =============================================================================
// Unitz.conversions( input, largestDenominator, min, max );
// =============================================================================

Unitz.conversions( '1.5 quarts' ); /* Unitz.Parsed with conversions: Unitz.Conversion
  conversions[0]
    decimal: 288
    fraction: Unitz.Fraction
    friendly: 288
    group: Unitz.Group
    longNormal: "288 teaspoons"
    longUnit: "teaspoons"
    shortNormal: "288 tsp"
    shortUnit: "tsp"
  ...
  conversions[3]
    decimal: 6
    fraction: Unitz.Fraction
    friendly: 6
    group: Unitz.Group
    longNormal: "6 cups"
    longUnit: "cups"
    shortNormal: "6 c"
    shortUnit: "c"
  ...
  conversions[6]
    decimal: 0.375
    fraction: Unitz.Fraction
    friendly: "3/8"
    group: Unitz.Group
    longNormal: "3/8 gallons"
    longUnit: "gallons"
    shortNormal: "3/8 gal"
    shortUnit: "gal"
*/
```

## Classes

### Volume
- `['tsp', 'ts', 'tsps', 'teaspoon', 'teaspoons']`
- `['tbsp', 'tbsps', 'tablespoon', 'tablespoons']`
- `['oz', 'ounce', 'ounces', 'fl-oz', 'fl oz', 'floz', 'fluid ounce', 'fl. oz.', 'oz. fl.', 'oz fl']`
- `['c', 'cup', 'cups']`
- `['pt', 'pint', 'pints']`
- `['qt', 'quart', 'quarts']`
- `['gal', 'gallon', 'gallons']`
- `['ml', 'millilitre', 'millilitres']`
- `['l', 'litre', 'litres']`
- `['mm3', 'mm^3', 'cubic mm', 'cubic millimeter', 'cubic millimeters']`
- `['cm3', 'cm^3', 'cubiccmm', 'cubic centimeter', 'cubic centimeters']`
- `['m3', 'm^3', 'cubic m', 'cubic meter', 'cubic meters']`
- `['km3', 'km^3', 'cubic km', 'meter', 'meters']`
- `['in3', 'in^3', 'cubic in', 'cubic inch', 'cubic inches']`
- `['ft3', 'ft^3', 'cubic ft', 'cubic foot', 'cubic feet']`
- `['yd3', 'yd^3', 'cubic yd', 'cubic yard', 'cubic yards']`

### Weight
- `['mg', 'milligram', 'milligrams']`
- `['g', 'gram', 'grams']`
- `['kg', 'kilogram', 'kilograms', 'kilo', 'kilos']`
- `['oz', 'ounce', 'ounces']`
- `['lb', 'lbs', 'pound', 'pounds']`
- `['ton', 'tons', 'tonnes']`

### Length
- `['in', 'inch', 'inches', '"']`
- `['ft', 'foot', 'feet', "'"]`
- `['yd', 'yds', 'yard', 'yards']`
- `['mi', 'mile', 'miles']`
- `['league', 'leagues']`
- `['mm', 'millimeter', 'millimeters']`
- `['cm', 'centimeter', 'centimeters']`
- `['dc', 'decimeter', 'decimeters']`
- `['m', 'meter', 'meters']`
- `['km', 'kilometer', 'kilometers']`

### Time
- `['ns', 'nanosecond', 'nanoseconds', 'nano', 'nanos']`
- `['us', 'microsecond', 'microseconds', 'micros', 'micro']`
- `['ms', 'millisecond', 'milliseconds', 'millis']`
- `['s', 'second', 'seconds', 'sec', 'secs']`
- `['min', 'minute', 'minutes', 'mins']`
- `['hr', 'hour', 'hours', 'hrs']`
- `['day', 'days']`
- `['wk', 'week', 'weeks', 'wks']`
- `['yr', 'year', 'years', 'yrs']`

### Area
- `['sqin', 'sq. in.', 'sq in', 'in2', 'in^2', 'square inch', 'square inches']`
- `['sqft', 'sq. ft.', 'sq ft', 'ft2', 'ft^2', 'square foot', 'square feet']`
- `['sqyd', 'sq. yd.', 'sq yd', 'yd2', 'yd^2', 'square yard', 'square yards']`
- `['acre', 'acres']`
- `['sqmi', 'sq. mi.', 'sq mi', 'mi2', 'mi^2', 'square mile', 'square miles']`
- `['sqmm', 'sq. mm.', 'sq mm', 'mm2', 'mm^2', 'square millimeter', 'square millimeters']`
- `['sqcm', 'sq. cm.', 'sq cm', 'cm2', 'cm^2', 'square centimeter', 'square centimeters']`
- `['sqm', 'sq. m.', 'sq m', 'm2', 'm^2', 'square meter', 'square meters']`
- `['sqkm', 'sq. km.', 'sq km', 'km2', 'km^2', 'square kilometer', 'square kilometers']`

### Digital
- `['bit', 'bits']`
- `['nibble', 'nibbles']`
- `['b', 'byte', 'bytes']`
- `['kb', 'kilobyte', 'kilobytes']`
- `['mb', 'megabyte', 'megabytes']`
- `['gb', 'gigabyte', 'gigabytes']`
- `['tb', 'terabyte', 'terabytes']`
- `['pb', 'petabyte', 'petabytes']`
- `['eb', 'exabyte', 'exabytes']`
- `['kbit', 'kilobit', 'kilobits']`
- `['mbit', 'megabit', 'megabits']`
- `['gbit', 'gigabit', 'gigabits']`
- `['tbit', 'terabit', 'terabits']`
- `['pbit', 'petabit', 'petabits']`
- `['ebit', 'exabit', 'exabits']`

### Rotation
- `['deg', 'degs', 'degree', 'degrees']`
- `['rad', 'rads', 'radian', 'radians']`
