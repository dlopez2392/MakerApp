export interface Fraction {
  whole: number;
  numerator: number;
  denominator: number;
}

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}

export function reduce(f: Fraction): Fraction {
  if (f.numerator === 0) {
    return { whole: f.whole, numerator: 0, denominator: 1 };
  }
  const g = gcd(f.numerator, f.denominator);
  const num = f.numerator / g;
  const den = f.denominator / g;
  const extraWhole = Math.floor(num / den);
  return {
    whole: f.whole + extraWhole,
    numerator: num - extraWhole * den,
    denominator: den,
  };
}

export function parseFraction(input: string): Fraction {
  const trimmed = input.trim();

  // Mixed number: "3 5/8"
  const mixedMatch = trimmed.match(/^(-?\d+)\s+(\d+)\/(\d+)$/);
  if (mixedMatch) {
    return {
      whole: parseInt(mixedMatch[1], 10),
      numerator: parseInt(mixedMatch[2], 10),
      denominator: parseInt(mixedMatch[3], 10),
    };
  }

  // Simple fraction: "3/8"
  const fractionMatch = trimmed.match(/^(-?\d+)\/(\d+)$/);
  if (fractionMatch) {
    return {
      whole: 0,
      numerator: parseInt(fractionMatch[1], 10),
      denominator: parseInt(fractionMatch[2], 10),
    };
  }

  // Whole number: "5"
  const wholeMatch = trimmed.match(/^(-?\d+)$/);
  if (wholeMatch) {
    return {
      whole: parseInt(wholeMatch[1], 10),
      numerator: 0,
      denominator: 1,
    };
  }

  throw new Error(`Cannot parse fraction: "${input}"`);
}

export function toDecimal(f: Fraction): number {
  return f.whole + f.numerator / f.denominator;
}

function toImproperNumerator(f: Fraction): number {
  return f.whole * f.denominator + f.numerator;
}

function fromImproper(numerator: number, denominator: number): Fraction {
  if (denominator === 0) {
    throw new Error("Division by zero");
  }
  if (numerator < 0) {
    // Handle negatives simply
    const positive = fromImproper(-numerator, denominator);
    return {
      whole: -positive.whole,
      numerator: positive.numerator,
      denominator: positive.denominator,
    };
  }
  const g = gcd(numerator, denominator);
  const reducedNum = numerator / g;
  const reducedDen = denominator / g;
  const whole = Math.floor(reducedNum / reducedDen);
  const remainder = reducedNum - whole * reducedDen;
  return {
    whole,
    numerator: remainder,
    denominator: reducedDen,
  };
}

export function add(a: Fraction, b: Fraction): Fraction {
  const numA = toImproperNumerator(a);
  const numB = toImproperNumerator(b);
  const commonDen = a.denominator * b.denominator;
  const sumNum = numA * b.denominator + numB * a.denominator;
  return fromImproper(sumNum, commonDen);
}

export function subtract(a: Fraction, b: Fraction): Fraction {
  const numA = toImproperNumerator(a);
  const numB = toImproperNumerator(b);
  const commonDen = a.denominator * b.denominator;
  const diffNum = numA * b.denominator - numB * a.denominator;
  return fromImproper(diffNum, commonDen);
}

export function multiply(a: Fraction, b: Fraction): Fraction {
  const numA = toImproperNumerator(a);
  const numB = toImproperNumerator(b);
  return fromImproper(numA * numB, a.denominator * b.denominator);
}

export function divide(a: Fraction, b: Fraction): Fraction {
  const numA = toImproperNumerator(a);
  const numB = toImproperNumerator(b);
  return fromImproper(numA * b.denominator, a.denominator * numB);
}

export function decimalToNearestFraction(decimal: number, maxDenom: number): Fraction {
  const whole = Math.floor(decimal);
  const fractionalPart = decimal - whole;

  if (fractionalPart === 0) {
    return { whole, numerator: 0, denominator: 1 };
  }

  let bestNumerator = 0;
  let bestDenominator = 1;
  let bestError = fractionalPart;

  // Iterate through powers of 2 up to maxDenom
  for (let den = 2; den <= maxDenom; den *= 2) {
    const num = Math.round(fractionalPart * den);
    const error = Math.abs(fractionalPart - num / den);
    if (error < bestError) {
      bestError = error;
      bestNumerator = num;
      bestDenominator = den;
    }
    if (error === 0) break;
  }

  // Reduce the result
  if (bestNumerator === 0) {
    return { whole, numerator: 0, denominator: 1 };
  }

  const g = gcd(bestNumerator, bestDenominator);
  return {
    whole,
    numerator: bestNumerator / g,
    denominator: bestDenominator / g,
  };
}
