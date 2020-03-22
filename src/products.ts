/**
 * A Service GCP Provides
 * e.g. Logging
 */
export interface Product {
  /**
   * Name of the product.
   * Follow the notation on console.
   */
  name: string;

  /**
   * Path to the product after `console.cloud.google.com`.
   * Set minimal path redirecting to the default feature.
   */
  path: string;

  /**
   * The feature list the product containing.
   */
  features: Feature[];
}

/**
 * A Menu Item in a Product
 * e.g. Viewer
 */
export interface Feature {
  /**
   * Name of the feature.
   * Follow the notation on console.
   */
  name: string;

  /**
   * Path to the feature after `console.cloud.google.com`
   * Set the default url when clicking a menu item.
   */
  path: string;
}

// Order by listed on console
export const products: Product[] = [
  /* Category: Admin */
  {
    name: 'IAM & Admin',
    path: '/iam-admin',
    features: [
      {name: 'IAM', path: '/iam-admin/iam'},
      {name: 'Identity', path: '/iam-admin/cloudidentity/consumer'},
      {name: 'Policy Troubleshooter', path: '/iam-admin/troubleshooter'},
      {name: 'Service accounts', path: '/iam-admin/serviceaccounts'},
      // and more
    ],
  },
  {
    name: 'Support',
    path: '/support',
    features: [
      {name: 'Overview', path: '/support'},
      {name: 'Cases', path: '/support/cases'},
      // and more
    ],
  },

  /* Category: Computing */
  {
    name: 'App Engine',
    path: '/appengine',
    features: [
      {name: 'Dashboard', path: '/appengine'},
      {name: 'Services', path: '/appengine/services'},
      // and more
    ],
  },
  {
    name: 'Cloud Functions',
    path: '/functions',
    features: [
      // listed on 2020-03-16
    ],
  },

  /* Category: Storage */
  {
    name: 'Datastore',
    path: '/datastore',
    features: [
      {name: 'Entity', path: '/datastore/entities'},
      {name: 'Dashboard', path: '/datastore/stats'},
      {name: 'Indexes', path: '/datastore/indexes'},
      {name: 'Admin', path: '/datastore/settings'},
      // listed on 2020-03-16
    ],
  },
  {
    name: 'Firestore',
    path: '/firestore',
    features: [
      {name: 'Data', path: '/firestore/data'},
      {name: 'Indexes', path: '/firestore/indexes'},
      // listed on 2020-03-16
    ],
  },
  {
    name: 'Storage',
    path: '/storage',
    features: [
      {name: 'Browser', path: '/storage/browser'},
      {name: 'Transfer', path: '/storage/transfer'},
      // and more
    ],
  },
  {
    name: 'Memorystore',
    path: '/memorystore',
    features: [
      // listed on 2020-03-16
    ],
  },
  {
    name: 'Data Transfer',
    path: '/transfer',
    features: [
      // and more
    ],
  },

  /* Category: Networking */
  {
    name: 'VPC network',
    path: '/networking',
    features: [
      {name: 'VPC networks', path: '/networking/networks'},
      {name: 'External IP addresses', path: '/networking/addresses'},
      {name: 'Firewall rules', path: '/networking/firewalls'},
      // ...
      {name: 'Serverless VPC access', path: '/networking/connectors'},
      // and more
    ],
  },

  /* Category: Operations */
  {
    name: 'Monitoring',
    path: '/monitoring',
    features: [
      {name: 'Overview', path: '/monitoring'},
      {name: 'Dashboards', path: '/monitoring/dashboards'},
      {name: 'Metrics explorer', path: '/monitoring/metrics-explorer'},
      {name: 'Alerting', path: '/monitoring/alerting'},
      {name: 'Uptime checks', path: '/monotoring/uptime'},
      {name: 'Groups', path: '/monitoring/groups'},
      {name: 'Settings', path: '/monitoring/settings'},
      // listed on 2020-03-16
    ],
  },
  {
    name: 'Trace',
    path: '/traces',
    features: [
      {name: 'Overview', path: '/traces/overview'},
      {name: 'Trace list', path: '/traces/list'},
      {name: 'Analytics reports', path: '/traces/tasks'},
      // listed on 2020-03-16
    ],
  },
  {
    name: 'Logging',
    path: '/logs',
    features: [
      {name: 'Log Viewer', path: '/logs/viewer'},
      {name: 'Log Viewer(preview)', path: '/logs/query'},
      {name: 'Logs-based Metrics', path: '/logs/metrics'},
      {name: 'Logs Router', path: '/logs/exports'},
      {name: 'Logs ingestion', path: '/logs/usage'},
      // listed on 2020-03-16
    ],
  },
  {
    name: 'Error Reporting',
    path: '/errors',
    features: [
      // listed on 2020-03-16
    ],
  },

  /* Category: Tools */
  {
    name: 'Cloud Build',
    path: '/cloud-build',
    features: [
      {name: 'Dashboard', path: '/cloud-build/dashboard'},
      {name: 'History', path: '/cloud-build/builds'},
      {name: 'Triggers', path: '/cloud-build/triggers'},
      {name: 'Settings', path: '/cloud-build/settings'},
      // listed on 2020-03-16
    ],
  },
  {
    name: 'Cloud Tasks',
    path: '/cloudtasks',
    features: [
      // listed on 2020-03-16
    ],
  },
  {
    name: 'Container Registry',
    path: '/gcr',
    features: [
      {name: 'Images', path: '/gcr/images'}, // TODO /gcr/images/${projectId}
      {name: 'Settings', path: '/gcr/settings'},
    ],
  },
  {
    name: 'Cloud Scheduler',
    path: '/cloudscheduler',
    features: [
      // listed on 2020-03-16
    ],
  },
  {
    name: 'Endpoints',
    path: '/endpoints',
    features: [
      {name: 'Services', path: '/endpoints'},
      {name: 'Developer Portal', path: '/endpoints/portal'},
      // listed on 2020-03-16
    ],
  },

  /* Category: Big Data */
  {
    name: 'Pub/Sub',
    path: '/cloudpubsub',
    features: [
      {name: 'Topics', path: '/cloudpubsub/topic/list'},
      {name: 'Subscriptions', path: '/cloudpubsub/subscription/list'},
      {name: 'Snapshots', path: '/cloudpubsub/snapshot/list'},
      // listed on 2020-03-16
    ],
  },
  {
    name: 'BigQuery',
    path: '/bigquery',
    features: [
      // and more
    ],
  },

  /* Category: Artifical Intelligence */
  {
    name: 'Vision',
    path: '/vision',
    features: [
      {name: 'Dashboard', path: '/vision/dashboard'},
      {name: 'Datasets', path: '/vision/datasets'},
      {name: 'Models', path: '/vision/models'},
      // listed on 2020-03-16
    ],
  },
];

/**
 * Resource is a reference to a concrete resource.
 */
export interface Resource {
  /** Unique name of the resource. */
  name: string;

  /** Minimal path to the resource without query params. */
  path: string;

  /**
   * Minimal query params to the resource.
   * Don't append projectId.
   */
  query: {[key: string]: string};
}

export interface ResourceDefs {
  /** Name of resources under a Product or Feature. */
  name: string;

  /** Path to a parent Product or Feature. */
  parentPath: string;

  /** Parse url to detect a Resource. */
  parse(url: URL): Resource | undefined;
}

export const resources: ResourceDefs[] = [
  {
    name: 'Function',
    parentPath: '/functions',
    parse: (url: URL) => {
      const pattern = /\/functions\/details\/(?:[^/]+)\/([^/]+)/;
      const m = url.pathname.match(pattern);
      if (!m) return undefined;
      return {
        name: m[1],
        path: url.pathname,
        query: {},
      };
    },
  },
  {
    name: 'Service',
    parentPath: '/appengine/versions',
    parse: (url: URL) => {
      const pattern = /\/appengine\/versions/;
      const m = url.pathname.match(pattern);
      const serviceId = url.searchParams.get('serviceId');
      if (!m || !serviceId) return undefined;
      return {
        name: serviceId,
        path: url.pathname,
        query: {serviceId},
      };
    },
  },
];
