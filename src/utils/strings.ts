export function formatCategoryLabel(category: string): string {
  return category
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function toPascalCase(value: string): string {
  return value
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\s+/g, '');
}

export function toCamelCase(value: string): string {
  const pascal = toPascalCase(value);
  return pascal ? pascal[0].toLowerCase() + pascal.slice(1) : pascal;
}

export function toKebabCase(value: string): string {
  return value
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();
}

export function normalizeBaseUrl(value: string): string {
  return value.endsWith('/') ? value : `${value}/`;
}
