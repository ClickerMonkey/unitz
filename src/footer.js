
  Unitz.classes = classes;
  Unitz.classMap = classMap;
  Unitz.unitToClass = unitToClass;
  Unitz.regex = /^\s*(-?\d*)(\s+(\d+))?(\/(\d+)|\.(\d+)|)\s*(.*)\s*$/i;
  Unitz.epsilon = 0.001;
  Unitz.separator = ',';
  Unitz.separatorJoin = ', ';
  Unitz.heuristicLength = 3;

  Unitz.parse = parse;
  Unitz.parseInput = parseInput;
  Unitz.convert = convert;
  Unitz.best = best;
  Unitz.splitInput = splitInput;
  Unitz.combine = combine;
  Unitz.subtract = subtract;
  Unitz.compound = compound;
  Unitz.isHeuristicMatch = isHeuristicMatch;
  Unitz.conversions = conversions;
  Unitz.isSingular = isSingular;
  Unitz.isWhole = isWhole;
  Unitz.findUnit = findUnit;
  Unitz.addClass = addClass;
  Unitz.removeUnit = removeUnit;
  Unitz.removeGroup = removeGroup;

  Unitz.Class = UnitzClass;
  Unitz.Group = UnitzGroup;
  Unitz.Parsed = UnitzParsed;
  Unitz.Fraction = UnitzFraction;

  return Unitz;

}));
