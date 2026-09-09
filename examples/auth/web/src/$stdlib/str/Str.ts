function requireString(value: unknown): string {
  if (typeof value !== 'string') {
    const got = value === null ? 'null' : typeof value;
    throw new Error(`Expected string, got ${got}`);
  }
  return value;
}

function words(value: string): string[] {
  return value
    .replace(/([a-z\d])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .split(/[^A-Za-z0-9]+/)
    .filter((part) => part.length > 0);
}

function title(part: string): string {
  return part.charAt(0).toUpperCase() + part.slice(1);
}

export class Str {
  private constructor() {}

  static isEmpty(value: unknown): boolean {
    return value === '';
  }

  static isNullOrEmpty(value: unknown): boolean {
    return value == null || value === '';
  }

  static format(text: string, data: Record<string, unknown>): string {
    return text.replace(/\{(\w+)\}/g, (_, key) => String(data[key] ?? ''));
  }

  static kebabCase(value: unknown): string {
    return words(requireString(value))
      .map((part) => part.toLowerCase())
      .join('-');
  }

  static camelCase(value: unknown): string {
    const parts = words(requireString(value)).map((part) => part.toLowerCase());
    if (parts.length === 0) return '';
    const [first, ...rest] = parts;
    return first + rest.map(title).join('');
  }

  static capitalize(value: unknown): string {
    const text = requireString(value);
    if (text.length === 0) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }
}
