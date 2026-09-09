const TOKEN = /:([A-Za-z_][\w]*)/g;

export function expand(
  pattern: string,
  params: Record<string, string | number>,
): string {
  const used = new Set<string>();
  const path = pattern.replace(TOKEN, (_match, name: string) => {
    if (!Object.prototype.hasOwnProperty.call(params, name)) {
      throw new Error(`Missing path param "${name}"`);
    }
    used.add(name);
    return encodeURIComponent(String(params[name]));
  });

  for (const name of Object.keys(params)) {
    if (!used.has(name)) {
      throw new Error(`Unexpected path param "${name}"`);
    }
  }

  return path;
}
