import {describe, expect, it} from 'vitest';

import type {ServiceDef} from './catalog.ts';
import {search} from './search.ts';
import type {VisitState} from './visits.ts';

const services: ServiceDef[] = [
  {
    id: 'run',
    name: 'Cloud Run',
    aliases: ['run'],
    pages: [
      {
        id: 'run.top',
        name: 'Services',
        pattern: '/run',
      },
      {
        id: 'run.service',
        name: 'Service',
        pattern: '/run/detail/:region/:service',
        resource: {kind: 'Service', nameParam: 'service'},
      },
    ],
  },
  {
    id: 'storage',
    name: 'Cloud Storage',
    aliases: ['gcs'],
    pages: [
      {
        id: 'storage.top',
        name: 'Buckets',
        pattern: '/storage/browser',
      },
    ],
  },
  {
    id: 'iam',
    name: 'IAM & Admin',
    aliases: ['iam'],
    pages: [
      {
        id: 'iam.serviceaccounts',
        name: 'Service Accounts',
        aliases: ['sa'],
        pattern: '/iam-admin/serviceaccounts',
      },
    ],
  },
];

function emptyState(): VisitState {
  return {schemaVersion: 2, visits: [], projects: []};
}

const now = 1_700_000_000_000;

describe('search', () => {
  it('ranks a visited resource matching by name at the top', () => {
    const state = emptyState();
    state.visits = [
      {
        pageId: 'run.service',
        params: {region: 'asia-northeast1', service: 'my-api'},
        project: 'my-project',
        visitCount: 5,
        lastVisitedAt: now,
      },
      {
        pageId: 'run.top',
        params: {},
        project: 'my-project',
        visitCount: 1,
        lastVisitedAt: now,
      },
    ];

    const result = search(['my-api'], services, state, now);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].resourceName).toBe('my-api');
    expect(result[0].url).toContain('my-api');
  });

  it('ignores visits referencing an unknown pageId', () => {
    const state = emptyState();
    state.visits = [
      {
        pageId: 'nonexistent.page',
        params: {},
        project: 'my-project',
        visitCount: 10,
        lastVisitedAt: now,
      },
    ];

    const result = search(['anything'], services, state, now);
    expect(result).toEqual([]);
  });

  it('surfaces catalog x project candidates for unvisited pages', () => {
    const state = emptyState();
    state.projects = [
      {project: 'my-project', visitCount: 3, lastVisitedAt: now},
    ];

    const result = search(['storage'], services, state, now);
    expect(result.length).toBeGreaterThan(0);
    const match = result.find(c => c.page.id === 'storage.top');
    expect(match).toBeDefined();
    expect(match?.project).toBe('my-project');
  });

  it('dedupes candidates with the same url, keeping the higher score', () => {
    const state = emptyState();
    state.visits = [
      {
        pageId: 'run.top',
        params: {},
        project: 'my-project',
        visitCount: 1,
        lastVisitedAt: now,
      },
    ];
    state.projects = [
      {project: 'my-project', visitCount: 100, lastVisitedAt: now},
    ];

    const result = search(['run'], services, state, now);
    const urls = result.map(c => c.url);
    expect(new Set(urls).size).toBe(urls.length);
  });

  it('matches a catalog x project candidate by page alias', () => {
    const state = emptyState();
    state.projects = [
      {project: 'my-project', visitCount: 3, lastVisitedAt: now},
    ];

    const result = search(['sa'], services, state, now);
    const match = result.find(c => c.page.id === 'iam.serviceaccounts');
    expect(match).toBeDefined();
    expect(match?.project).toBe('my-project');
  });

  it('returns visited candidates by frecency when tokens are empty', () => {
    const state = emptyState();
    state.visits = [
      {
        pageId: 'run.top',
        params: {},
        project: 'my-project',
        visitCount: 1,
        lastVisitedAt: now - 1000,
      },
      {
        pageId: 'storage.top',
        params: {},
        project: 'my-project',
        visitCount: 10,
        lastVisitedAt: now,
      },
    ];

    const result = search([], services, state, now);
    expect(result[0].page.id).toBe('storage.top');
  });
});
