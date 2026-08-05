import {describe, expect, it} from 'vitest';

import type {ServiceDef} from './catalog.ts';
import {parseQuery, search} from './search.ts';
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

    const result = search(parseQuery(['my-api']), services, state, now);
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

    const result = search(parseQuery(['anything']), services, state, now);
    expect(result).toEqual([]);
  });

  it('surfaces catalog x project candidates for unvisited pages', () => {
    const state = emptyState();
    state.projects = [
      {project: 'my-project', visitCount: 3, lastVisitedAt: now},
    ];

    const result = search(parseQuery(['storage']), services, state, now);
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

    const result = search(parseQuery(['run']), services, state, now);
    const urls = result.map(c => c.url);
    expect(new Set(urls).size).toBe(urls.length);
  });

  it('matches a catalog x project candidate by page alias', () => {
    const state = emptyState();
    state.projects = [
      {project: 'my-project', visitCount: 3, lastVisitedAt: now},
    ];

    const result = search(parseQuery(['sa']), services, state, now);
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

    const result = search(parseQuery([]), services, state, now);
    expect(result[0].page.id).toBe('storage.top');
  });
});

describe('parseQuery', () => {
  it('parses short and long form filter prefixes', () => {
    expect(parseQuery(['p:my-proj'])).toEqual({
      terms: [],
      projectFilters: ['my-proj'],
      serviceFilters: [],
    });
    expect(parseQuery(['project:my-proj'])).toEqual({
      terms: [],
      projectFilters: ['my-proj'],
      serviceFilters: [],
    });
    expect(parseQuery(['s:run'])).toEqual({
      terms: [],
      projectFilters: [],
      serviceFilters: ['run'],
    });
    expect(parseQuery(['service:run'])).toEqual({
      terms: [],
      projectFilters: [],
      serviceFilters: ['run'],
    });
  });

  it('mixes filters and terms, ignoring empty-value filter tokens', () => {
    const result = parseQuery(['s:run', 'p:', 'log', 'project:my-proj']);
    expect(result).toEqual({
      terms: ['log'],
      projectFilters: ['my-proj'],
      serviceFilters: ['run'],
    });
  });

  it('keeps non-filter tokens as terms', () => {
    expect(parseQuery(['my-api', 'log'])).toEqual({
      terms: ['my-api', 'log'],
      projectFilters: [],
      serviceFilters: [],
    });
  });
});

describe('search with filters', () => {
  it('excludes candidates from other services when a service filter is set', () => {
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
        pageId: 'storage.top',
        params: {},
        project: 'my-project',
        visitCount: 5,
        lastVisitedAt: now,
      },
    ];

    const result = search(
      parseQuery(['s:run', 'my-api']),
      services,
      state,
      now,
    );
    expect(result.some(c => c.service.id === 'storage')).toBe(false);
    expect(result.some(c => c.service.id === 'run')).toBe(true);
  });

  it('matches a service filter via alias', () => {
    const state = emptyState();
    state.projects = [
      {project: 'my-project', visitCount: 3, lastVisitedAt: now},
    ];

    const result = search(parseQuery(['s:gcs']), services, state, now);
    expect(result.every(c => c.service.id === 'storage')).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('filters candidates by project', () => {
    const state = emptyState();
    state.visits = [
      {
        pageId: 'run.top',
        params: {},
        project: 'project-a',
        visitCount: 5,
        lastVisitedAt: now,
      },
      {
        pageId: 'run.top',
        params: {},
        project: 'project-b',
        visitCount: 5,
        lastVisitedAt: now,
      },
    ];

    const result = search(
      parseQuery(['p:project-a', 'run']),
      services,
      state,
      now,
    );
    expect(result.every(c => c.project === 'project-a')).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('excludes visited candidates without a project when a project filter is set', () => {
    const state = emptyState();
    state.visits = [
      {
        pageId: 'run.top',
        params: {},
        visitCount: 5,
        lastVisitedAt: now,
      },
    ];

    const result = search(
      parseQuery(['p:project-a', 'run']),
      services,
      state,
      now,
    );
    expect(result.length).toBe(0);
  });

  it('reaches a project outside the top-5 frecency window with a project filter', () => {
    const state = emptyState();
    // 6 projects; the filtered one is the least frecent (rank 6).
    state.projects = [
      {project: 'proj-1', visitCount: 50, lastVisitedAt: now},
      {project: 'proj-2', visitCount: 40, lastVisitedAt: now},
      {project: 'proj-3', visitCount: 30, lastVisitedAt: now},
      {project: 'proj-4', visitCount: 20, lastVisitedAt: now},
      {project: 'proj-5', visitCount: 10, lastVisitedAt: now},
      {project: 'rare-project', visitCount: 1, lastVisitedAt: now},
    ];

    const result = search(
      parseQuery(['p:rare-project', 'storage']),
      services,
      state,
      now,
    );
    const match = result.find(c => c.page.id === 'storage.top');
    expect(match).toBeDefined();
    expect(match?.project).toBe('rare-project');
  });

  it('ORs multiple project filters of the same kind', () => {
    const state = emptyState();
    state.projects = [
      {project: 'project-a', visitCount: 3, lastVisitedAt: now},
      {project: 'project-b', visitCount: 3, lastVisitedAt: now},
      {project: 'project-c', visitCount: 3, lastVisitedAt: now},
    ];

    const result = search(
      parseQuery(['p:project-a', 'p:project-b', 'storage']),
      services,
      state,
      now,
    );
    const projects = new Set(result.map(c => c.project));
    expect(projects.has('project-a')).toBe(true);
    expect(projects.has('project-b')).toBe(true);
    expect(projects.has('project-c')).toBe(false);
  });

  it('returns candidates by frecency-based boost when terms are empty but filters are set', () => {
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
      {project: 'my-project', visitCount: 3, lastVisitedAt: now},
    ];

    const result = search(
      parseQuery(['s:run', 'p:my-project']),
      services,
      state,
      now,
    );
    expect(result.length).toBeGreaterThan(0);
    expect(result.every(c => c.service.id === 'run')).toBe(true);
    expect(result.every(c => c.project === 'my-project')).toBe(true);
  });
});
