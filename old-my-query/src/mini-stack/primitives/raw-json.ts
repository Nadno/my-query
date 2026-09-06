export type RawJSONValue = string | boolean | number | null;

export default class RawJSON {
  public static readonly IS_INTEGER_REGEX = /^([-+])?[0-9]+$/;
  public static readonly IS_FLOAT_REGEX = /^([-+])?[0-9]+\.[0-9]+$/;

  public static parse<TExpected extends RawJSONValue>(
    value: string,
  ): TExpected {
    if (RawJSON.isNull(value)) return null as TExpected;
    if (RawJSON.isBoolean(value)) return (value === 'true') as TExpected;
    if (RawJSON.isInteger(value)) return parseInt(value) as TExpected;
    if (RawJSON.isFloat(value)) return parseFloat(value) as TExpected;
    return value as TExpected;
  }

  public static stringify(value: RawJSONValue): string {
    return String(value);
  }

  public static isInteger(value: string): boolean {
    return RawJSON.IS_INTEGER_REGEX.test(value);
  }

  public static isFloat(value: string): boolean {
    return RawJSON.IS_FLOAT_REGEX.test(value);
  }

  public static isBoolean(value: string): boolean {
    return value === 'true' || value === 'false';
  }

  public static isNull(value: string) {
    return value === 'null';
  }
}
