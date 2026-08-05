/**
 * Catalog engine: declarative URL patterns for Google Cloud console pages.
 *
 * A single `pattern` per page drives both directions:
 * - detection: URL -> PageHit (which page, which resource, which project)
 * - generation: PageHit -> URL (to jump there from the omnibox)
 */

export interface ServiceDef {
  /** Stable ID referenced by visit history. Never change once released. */
  id: string;

  /** Name of the service. Follow the notation on console. */
  name: string;

  /** Additional search keywords (e.g. abbreviations like 'gcs'). */
  aliases?: string[];

  pages: PageDef[];
}

export interface PageDef {
  /** Stable unique ID in the form '<serviceId>.<key>'. Never change once released. */
  id: string;

  /** Name of the page. Follow the notation on console. */
  name: string;

  /** Additional search keywords (e.g. abbreviations like 'sa' for Service accounts). */
  aliases?: string[];

  /**
   * URLPattern pathname after `console.cloud.google.com`.
   * `:param` captures a single path segment.
   * Deeper subpaths (e.g. detail page tabs) match implicitly.
   * e.g. '/run/detail/:region/:service'
   */
  pattern: string;

  /**
   * Query params required to identify this page.
   * A ':param' value captures the actual value, any other value must match
   * literally. `project` is handled separately and must not appear here.
   */
  query?: {[key: string]: string};

  /** Set when the page points to a concrete named resource. */
  resource?: {
    /** Kind of the resource. e.g. 'Service' */
    kind: string;

    /** The captured param whose value is the resource name. */
    nameParam: string;
  };

  /**
   * Real console URLs that must resolve to this page.
   * Verified by tests; every resource page must have at least one.
   */
  examples?: string[];
}

/** A page detected from, or navigable to, a console URL. */
export interface PageHit {
  pageId: string;
  params: {[key: string]: string};
  project?: string;
}

export const consoleOrigin = 'https://console.cloud.google.com';

const patternCache = new Map<string, URLPattern>();

function compile(pattern: string): URLPattern {
  let compiled = patternCache.get(pattern);
  if (!compiled) {
    // '{/*}?' allows deeper subpaths (detail tabs etc.) to match.
    compiled = new URLPattern({pathname: pattern + '{/*}?'});
    patternCache.set(pattern, compiled);
  }
  return compiled;
}

/** Named params appearing in a pattern, in order. */
export function patternParams(pattern: string): string[] {
  return [...pattern.matchAll(/:([A-Za-z0-9_]+)/g)].map(m => m[1]);
}

/**
 * Specificity for picking the best match when multiple patterns hit.
 * Static segments weigh more than captured ones.
 */
function specificity(page: PageDef): number {
  const segments = page.pattern.split('/').filter(s => s !== '');
  const statics = segments.filter(s => !s.startsWith(':')).length;
  const params = segments.length - statics;
  const queries = Object.keys(page.query || {}).length;
  return statics * 10 + params * 3 + queries * 3;
}

function matchPage(
  page: PageDef,
  url: URL,
): {[key: string]: string} | undefined {
  const result = compile(page.pattern).exec({pathname: url.pathname});
  if (!result) return undefined;

  const params: {[key: string]: string} = {};
  for (const [key, value] of Object.entries(result.pathname.groups)) {
    // Numeric keys are unnamed wildcard groups (the implicit suffix).
    if (value === undefined || /^\d+$/.test(key)) continue;
    params[key] = decodeURIComponent(value);
  }

  for (const [key, value] of Object.entries(page.query || {})) {
    const actual = url.searchParams.get(key);
    if (actual === null) return undefined;
    if (value.startsWith(':')) {
      params[value.slice(1)] = actual;
    } else if (actual !== value) {
      return undefined;
    }
  }
  return params;
}

/** Detect the most specific page matching a console URL. */
export function matchUrl(
  services: ServiceDef[],
  input: string,
): PageHit | undefined {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    return undefined;
  }
  if (url.origin !== consoleOrigin) return undefined;

  const project = url.searchParams.get('project') || undefined;

  let best: {hit: PageHit; score: number} | undefined;
  for (const service of services) {
    for (const page of service.pages) {
      const params = matchPage(page, url);
      if (!params) continue;
      const score = specificity(page);
      if (!best || best.score < score) {
        best = {hit: {pageId: page.id, params, project}, score};
      }
    }
  }
  return best?.hit;
}

/** Build a console URL from a PageHit. Returns undefined on missing params. */
export function buildUrl(
  services: ServiceDef[],
  hit: PageHit,
): string | undefined {
  const found = findPage(services, hit.pageId);
  if (!found) return undefined;
  const {page} = found;

  let missing = false;
  const pathname = page.pattern.replace(/:([A-Za-z0-9_]+)/g, (_, name) => {
    const value = hit.params[name];
    if (value === undefined) {
      missing = true;
      return '';
    }
    return encodeURIComponent(value);
  });
  if (missing) return undefined;

  const url = new URL(pathname, consoleOrigin);
  for (const [key, value] of Object.entries(page.query || {})) {
    const actual = value.startsWith(':') ? hit.params[value.slice(1)] : value;
    if (actual === undefined) return undefined;
    url.searchParams.set(key, actual);
  }
  if (hit.project) url.searchParams.set('project', hit.project);
  return url.toString();
}

export function findPage(
  services: ServiceDef[],
  pageId: string,
): {service: ServiceDef; page: PageDef} | undefined {
  for (const service of services) {
    const page = service.pages.find(p => p.id === pageId);
    if (page) return {service, page};
  }
  return undefined;
}
