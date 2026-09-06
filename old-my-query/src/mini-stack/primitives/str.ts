class Str {
  static slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[-\s]+/g, '-');
  }

  static isEmpty(value: unknown): boolean {
    return value === '';
  }

  static isNullOrEmpty(value: unknown): boolean {
    return value == null || value === '';
  }

  static format(text: string, data: Record<string, unknown>): string {
    return text.replace(/\{(\w+)\}/g, (_, key) => String(data[key] ?? ''));
  }
}

