export type RawJSONValue = string | boolean | number | null;

function describeGot(value: unknown): string {
  return value === null ? 'null' : typeof value;
}

function requireString(value: unknown): string {
  if (typeof value !== 'string') {
    throw new Error(`Expected string, got ${describeGot(value)}`);
  }
  return value;
}

export class RawJSON {
  private constructor() {}

  private static readonly IS_INTEGER_REGEX = /^([-+])?[0-9]+$/;
  private static readonly IS_FLOAT_REGEX = /^([-+])?[0-9]+\.[0-9]+$/;

  private static isNull(treated: string): boolean {
    return treated.toLowerCase() === 'null';
  }

  private static isBoolean(treated: string): boolean {
    return /^(true|false)$/i.test(treated);
  }

  private static isInteger(treated: string): boolean {
    return RawJSON.IS_INTEGER_REGEX.test(treated);
  }

  private static isFloat(treated: string): boolean {
    return RawJSON.IS_FLOAT_REGEX.test(treated);
  }

  static parse(value: unknown): RawJSONValue {
    const original = requireString(value);
    const treated = original.trim();

    if (RawJSON.isNull(treated)) return null;
    if (RawJSON.isBoolean(treated)) return treated.toLowerCase() === 'true';
    if (RawJSON.isInteger(treated)) return parseInt(treated);
    if (RawJSON.isFloat(treated)) return parseFloat(treated);
    return original;
  }

  static stringify(value: unknown): string {
    if (
      value === null ||
      typeof value === 'string' ||
      typeof value === 'boolean' ||
      typeof value === 'number'
    ) {
      return String(value);
    }
    throw new Error(
      `Expected string | boolean | number | null, got ${describeGot(value)}`,
    );
  }
}
