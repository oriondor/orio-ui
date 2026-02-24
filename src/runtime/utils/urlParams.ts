/**
 * Utilities for serialising/deserialising nested values to/from flat URL query params.
 *
 * Encoding conventions:
 *   Object keys  →  dot notation      e.g.  filters.category=shirts
 *   Array items  →  bracket notation  e.g.  tags[0]=cats&tags[1]=dogs
 *   Combined     →                    e.g.  items[0].name=John
 *
 * Non-serialisable values (File, Blob, null, undefined) are silently skipped.
 * Empty strings produce no URL entry.
 */

// ─── flatten ─────────────────────────────────────────────────────────────────

/**
 * Recursively flattens a value to flat URL-compatible key-value pairs.
 *
 * @param value   The value to flatten (any depth)
 * @param prefix  URL param prefix / key name (e.g. "filters", "items[0]")
 *
 * @example
 * flattenParams({ category: 'shirts', tags: ['a', 'b'] }, 'filters')
 * // → { 'filters.category': 'shirts', 'filters.tags[0]': 'a', 'filters.tags[1]': 'b' }
 */
export function flattenParams(
  value: unknown,
  prefix: string,
): Record<string, string> {
  const result: Record<string, string> = {};
  _flatten(value, prefix, result);
  return result;
}

function _flatten(value: unknown, key: string, out: Record<string, string>) {
  if (value === null || value === undefined) return;
  if (value instanceof File || value instanceof Blob) return;

  if (typeof value === "string") {
    if (value !== "") out[key] = value;
    return;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    out[key] = String(value);
    return;
  }

  if (Array.isArray(value)) {
    for (const [i, item] of value.entries()) {
      _flatten(item, `${key}[${i}]`, out);
    }
    return;
  }

  if (typeof value === "object") {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      _flatten(v, `${key}.${k}`, out);
    }
  }
}

// ─── unflatten ───────────────────────────────────────────────────────────────

/**
 * Reconstructs a nested object from flat URL query params.
 * Handles dot notation (obj.key) and bracket notation (arr[0]), and combinations.
 *
 * When a URL param has multiple values (string[]) only the first is used.
 *
 * @example
 * unflattenParams({ 'filters.category': 'shirts', 'tags[0]': 'cats', 'tags[1]': 'dogs' })
 * // → { filters: { category: 'shirts' }, tags: ['cats', 'dogs'] }
 */
export function unflattenParams(
  flat: Record<string, string | string[]>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, raw] of Object.entries(flat)) {
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (value === undefined || value === "") continue;
    _setByPath(result, parsePath(key), value);
  }

  return result;
}

function _setByPath(
  root: Record<string, unknown>,
  path: (string | number)[],
  value: string,
) {
  if (path.length === 0) return;

  let current: unknown = root;

  for (let i = 0; i < path.length - 1; i++) {
    const seg = path[i]!;
    const nextSeg = path[i + 1]!;
    const parent = current as Record<string | number, unknown>;

    if (parent[seg] == null || typeof parent[seg] !== "object") {
      parent[seg] = typeof nextSeg === "number" ? [] : {};
    }

    current = parent[seg];
  }

  const lastSeg = path[path.length - 1]!;
  (current as Record<string | number, unknown>)[lastSeg] = value;
}

// ─── path parsing ─────────────────────────────────────────────────────────────

/**
 * Parses a flat URL param key into path segments.
 *
 * Supports dot notation and bracket notation, including keys with hyphens.
 *
 * @example
 * parsePath('a.b.c')          // ['a', 'b', 'c']
 * parsePath('product-color')  // ['product-color']
 * parsePath('items[0].name')  // ['items', 0, 'name']
 * parsePath('a[0][1].c')      // ['a', 0, 1, 'c']
 */
export function parsePath(path: string): (string | number)[] {
  const segments: (string | number)[] = [];

  for (const match of path.matchAll(/([^.[]+)|\[(\d+)\]/g)) {
    segments.push(match[1] !== undefined ? match[1] : parseInt(match[2]!, 10));
  }

  return segments;
}

// ─── helpers ─────────────────────────────────────────────────────────────────

/**
 * Extracts the distinct top-level keys from a flat params record.
 *
 * @example
 * topLevelKeys({ 'a': '1', 'b.c': '2', 'd[0]': '3' }) // ['a', 'b', 'd']
 */
export function topLevelKeys(flat: Record<string, unknown>): string[] {
  const keys = new Set<string>();
  for (const k of Object.keys(flat)) {
    const match = k.match(/^([^.[]+)/);
    if (match) keys.add(match[1]!);
  }
  return [...keys];
}
