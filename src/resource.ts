/**
 * Resource is a reference to a concrete resource.
 */
export interface Resource {
  /** Name of the Resource */
  name: string;

  /** Unique name of the resource. */
  uniqueName: string;

  /** Minimal path to the resource without query params. */
  path: string;

  /**
   * Minimal query params to the resource.
   * Don't append projectId.
   */
  query: {[key: string]: string};

  /** Project ID containign the resource. */
  project: string;
}

export interface ResourceDefs {
  /** Name of resources under a Product or Feature. */
  name: string;

  /** Path to a parent Product or Feature. */
  parentPath: string;

  /** Parse url to detect a Resource. */
  parse(url: URL): Omit<Resource, 'project'> | undefined;
}

export const resources: ResourceDefs[] = [
  {
    name: 'Function (Cloud Functions)',
    parentPath: '/functions',
    parse: function(url: URL) {
      const pattern = /\/functions\/details\/(?:[^/]+)\/([^/]+)/;
      const m = url.pathname.match(pattern);
      if (!m) return undefined;
      return {
        name: this.name,
        uniqueName: m[1],
        path: url.pathname,
        query: {},
      };
    },
  },
  {
    name: 'Service (App Engine)',
    parentPath: '/appengine/versions',
    parse: function(url: URL) {
      const pattern = /\/appengine\/versions/;
      const m = url.pathname.match(pattern);
      const serviceId = url.searchParams.get('serviceId');
      if (!m || !serviceId) return undefined;
      return {
        name: this.name,
        uniqueName: serviceId,
        path: url.pathname,
        query: {serviceId},
      };
    },
  },
  {
    name: 'Service (Cloud Run)',
    parentPath: '/run',
    parse: function(url: URL) {
      const pattern = /\/run\/detail\/(?:[^/]+)\/([^/]+)/;
      const m = url.pathname.match(pattern);
      if (!m) return undefined;
      return {
        name: this.name,
        uniqueName: m[1],
        path: url.pathname,
        query: {},
      };
    },
  },
];

export function equals(a?: Resource, b?: Resource): boolean {
  return a &&
    b &&
    a.name === b.name &&
    a.uniqueName === b.uniqueName &&
    a.path === b.path &&
    a.project === b.project
    ? true
    : false;
}
