import {describe, expect, test} from 'vitest';

import {buildUrl, matchUrl, patternParams} from '../catalog.ts';
import {apis} from './apis.ts';
import {appengine} from './appengine.ts';
import {artifactregistry} from './artifactregistry.ts';
import {bigquery} from './bigquery.ts';
import {bigtable} from './bigtable.ts';
import {billing} from './billing.ts';
import {cloudbuild} from './cloudbuild.ts';
import {cloudscheduler} from './cloudscheduler.ts';
import {cloudtasks} from './cloudtasks.ts';
import {compute} from './compute.ts';
import {dataflow} from './dataflow.ts';
import {errors} from './errors.ts';
import {firestore} from './firestore.ts';
import {functions} from './functions.ts';
import {iam} from './iam.ts';
import {services} from './index.ts';
import {kubernetes} from './kubernetes.ts';
import {logging} from './logging.ts';
import {monitoring} from './monitoring.ts';
import {pubsub} from './pubsub.ts';
import {run} from './run.ts';
import {secretmanager} from './secretmanager.ts';
import {spanner} from './spanner.ts';
import {sql} from './sql.ts';
import {storage} from './storage.ts';
import {trace} from './trace.ts';
import {vertexai} from './vertexai.ts';

// Explicit import list, independent of index.ts, so a service missing from
// the aggregate index is still exercised by these tests.
const allServices = [
  apis,
  appengine,
  artifactregistry,
  bigquery,
  bigtable,
  billing,
  cloudbuild,
  cloudscheduler,
  cloudtasks,
  compute,
  dataflow,
  errors,
  firestore,
  functions,
  iam,
  kubernetes,
  logging,
  monitoring,
  pubsub,
  run,
  secretmanager,
  spanner,
  sql,
  storage,
  trace,
  vertexai,
];

describe('services aggregate index', () => {
  test('index.ts exports the same set of services', () => {
    const indexIds = services.map(s => s.id).sort();
    const explicitIds = allServices.map(s => s.id).sort();
    expect(indexIds).toEqual(explicitIds);
  });
});

describe('service and page ids', () => {
  test('service ids are unique', () => {
    const ids = allServices.map(s => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('page ids are unique across all services', () => {
    const ids = allServices.flatMap(s => s.pages.map(p => p.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('page ids start with "<serviceId>."', () => {
    for (const service of allServices) {
      for (const page of service.pages) {
        expect(page.id.startsWith(`${service.id}.`)).toBe(true);
      }
    }
  });
});

describe('patterns', () => {
  test('every pattern compiles as a URLPattern', () => {
    for (const service of allServices) {
      for (const page of service.pages) {
        expect(() => new URLPattern({pathname: page.pattern})).not.toThrow();
      }
    }
  });
});

describe('resource definitions', () => {
  test('resource.nameParam is captured by the pattern or a query param', () => {
    for (const service of allServices) {
      for (const page of service.pages) {
        if (!page.resource) continue;
        const pathParams = patternParams(page.pattern);
        const queryParams = Object.values(page.query || {})
          .filter(v => v.startsWith(':'))
          .map(v => v.slice(1));
        const allParams = [...pathParams, ...queryParams];
        expect(allParams).toContain(page.resource.nameParam);
      }
    }
  });

  test('every resource page has at least one example', () => {
    for (const service of allServices) {
      for (const page of service.pages) {
        if (!page.resource) continue;
        expect(page.examples?.length ?? 0).toBeGreaterThan(0);
      }
    }
  });
});

describe('examples', () => {
  test('every example resolves to its own page via matchUrl', () => {
    for (const service of allServices) {
      for (const page of service.pages) {
        for (const example of page.examples || []) {
          const hit = matchUrl(services, example);
          expect(hit?.pageId, `example ${example} for page ${page.id}`).toBe(
            page.id,
          );
        }
      }
    }
  });

  test('resource page examples round-trip through matchUrl -> buildUrl -> matchUrl', () => {
    for (const service of allServices) {
      for (const page of service.pages) {
        if (!page.resource) continue;
        for (const example of page.examples || []) {
          const hit = matchUrl(services, example);
          expect(hit, `example ${example} for page ${page.id}`).toBeDefined();
          const rebuilt = buildUrl(services, hit!);
          expect(rebuilt, `rebuilding ${example}`).toBeDefined();
          const reHit = matchUrl(services, rebuilt!);
          expect(reHit, `re-matching ${rebuilt}`).toEqual(hit);
        }
      }
    }
  });
});
