import { IQueryAttributeValue } from '../../types';

export default class AttributeParser {
  public static readonly IS_INTEGER_REGEX = /^([-+])?[0-9]+$/;
  public static readonly IS_FLOAT_REGEX = /^([-+])?[0-9]+\.[0-9]+$/;

  public static parse<TExpected>(value: string): TExpected {
    if (AttributeParser.isBoolean(value))
      return (value === 'true') as TExpected;
    if (AttributeParser.isInteger(value)) return parseInt(value) as TExpected;
    if (AttributeParser.isFloat(value)) return parseFloat(value) as TExpected;
    return value as TExpected;
  }

  public static stringify(value: IQueryAttributeValue): string {
    return String(value);
  }

  public static isInteger(value: string): boolean {
    return AttributeParser.IS_INTEGER_REGEX.test(value);
  }

  public static isFloat(value: string): boolean {
    return AttributeParser.IS_FLOAT_REGEX.test(value);
  }

  public static isBoolean(value: string): boolean {
    return value === 'true' || value === 'false';
  }
}

export const parseAttribute = <TExpected extends IQueryAttributeValue>(
  value: string,
): TExpected => AttributeParser.parse<TExpected>(value);

export const stringifyAttribute = (value: IQueryAttributeValue): string =>
  AttributeParser.stringify(value);
