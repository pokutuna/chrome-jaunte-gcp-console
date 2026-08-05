import {describe, expect, test} from 'vitest';

import type {PageHit} from './catalog.ts';
import {VisitStore, frecency} from './visits.ts';
import type {StorageAreaLike} from './visits.ts';

const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

function fakeStorage(initial: {[key: string]: unknown} = {}): StorageAreaLike {
  const data: {[key: string]: unknown} = {...initial};
  return {
    get: (keys: string[]) => {
      const result: {[key: string]: unknown} = {};
      for (const key of keys) {
        if (key in data) result[key] = data[key];
      }
      return Promise.resolve(result);
    },
    set: (items: {[key: string]: unknown}) => {
      Object.assign(data, items);
      return Promise.resolve();
    },
  };
}

describe('frecency', () => {
  test('halves after 30 days', () => {
    const now = 1000 * thirtyDaysMs;
    const score = frecency(
      {visitCount: 4, lastVisitedAt: now - thirtyDaysMs},
      now,
    );
    expect(score).toBeCloseTo(2);
  });

  test('is unchanged at the same instant', () => {
    const now = 1000;
    expect(frecency({visitCount: 3, lastVisitedAt: now}, now)).toBeCloseTo(3);
  });
});

describe('VisitStore.getState', () => {
  test('returns empty state and persists schemaVersion 2 on first read', async () => {
    const local = fakeStorage();
    const store = new VisitStore(local, undefined, () => 1000);

    const state = await store.getState();
    expect(state).toEqual({schemaVersion: 2, visits: [], projects: []});

    const persisted = await local.get(['schemaVersion', 'visits', 'projects']);
    expect(persisted.schemaVersion).toBe(2);
    expect(persisted.visits).toEqual([]);
    expect(persisted.projects).toEqual([]);
  });

  test('seeds projects from legacy sync storage', async () => {
    const local = fakeStorage();
    const legacySync = fakeStorage({projects: ['proj-a', 'proj-b']});
    const store = new VisitStore(local, legacySync, () => 5000);

    const state = await store.getState();
    expect(state.schemaVersion).toBe(2);
    expect(state.projects).toEqual([
      {project: 'proj-a', visitCount: 1, lastVisitedAt: 5000},
      {project: 'proj-b', visitCount: 1, lastVisitedAt: 5000},
    ]);
    expect(state.visits).toEqual([]);

    // Legacy sync data must remain untouched.
    const legacyState = await legacySync.get(['projects']);
    expect(legacyState.projects).toEqual(['proj-a', 'proj-b']);
  });

  test('does not migrate when schemaVersion already present', async () => {
    const local = fakeStorage({schemaVersion: 2, visits: [], projects: []});
    const legacySync = fakeStorage({projects: ['should-not-seed']});
    const store = new VisitStore(local, legacySync, () => 1);

    const state = await store.getState();
    expect(state.projects).toEqual([]);
  });
});

describe('VisitStore.record', () => {
  const hit: PageHit = {
    pageId: 'run.service',
    params: {region: 'us-central1', service: 'my-svc'},
    project: 'my-project',
  };

  test('increments visitCount on a repeated identical hit', async () => {
    const local = fakeStorage();
    const store = new VisitStore(local, undefined, () => 1000);

    await store.record(hit);
    await store.record(hit);

    const state = await store.getState();
    expect(state.visits).toHaveLength(1);
    expect(state.visits[0].visitCount).toBe(2);
    expect(state.visits[0].lastVisitedAt).toBe(1000);
  });

  test('treats different params as separate visit entries', async () => {
    const local = fakeStorage();
    const store = new VisitStore(local, undefined, () => 1000);

    await store.record(hit);
    await store.record({
      ...hit,
      params: {region: 'us-central1', service: 'other-svc'},
    });

    const state = await store.getState();
    expect(state.visits).toHaveLength(2);
  });

  test('treats different key order in params as the same entry', async () => {
    const local = fakeStorage();
    const store = new VisitStore(local, undefined, () => 1000);

    await store.record(hit);
    await store.record({
      ...hit,
      params: {service: 'my-svc', region: 'us-central1'},
    });

    const state = await store.getState();
    expect(state.visits).toHaveLength(1);
    expect(state.visits[0].visitCount).toBe(2);
  });

  test('also upserts the project when hit.project is set', async () => {
    const local = fakeStorage();
    const store = new VisitStore(local, undefined, () => 1000);

    await store.record(hit);
    await store.record(hit);

    const state = await store.getState();
    expect(state.projects).toEqual([
      {project: 'my-project', visitCount: 2, lastVisitedAt: 1000},
    ]);
  });

  test('does not touch projects when hit.project is missing', async () => {
    const local = fakeStorage();
    const store = new VisitStore(local, undefined, () => 1000);

    await store.record({pageId: 'run.top', params: {}});

    const state = await store.getState();
    expect(state.projects).toEqual([]);
    expect(state.visits).toHaveLength(1);
  });

  test('prunes the lowest-frecency visit once over the cap', async () => {
    const local = fakeStorage({
      schemaVersion: 2,
      visits: Array.from({length: 500}, (_, i) => ({
        pageId: 'run.service',
        params: {region: 'us-central1', service: `svc-${i}`},
        visitCount: 1,
        // svc-0 is the oldest (lowest frecency); the rest are equally fresh.
        lastVisitedAt: i === 0 ? 0 : 100_000,
      })),
      projects: [],
    });
    const store = new VisitStore(local, undefined, () => 100_000);

    await store.record({
      pageId: 'run.service',
      params: {region: 'us-central1', service: 'svc-new'},
    });

    const state = await store.getState();
    expect(state.visits).toHaveLength(500);
    expect(state.visits.some(v => v.params.service === 'svc-0')).toBe(false);
    expect(state.visits.some(v => v.params.service === 'svc-new')).toBe(true);
  });

  test('re-reads from storage after record (cache is dropped)', async () => {
    const local = fakeStorage();
    const store = new VisitStore(local, undefined, () => 1000);

    await store.record(hit);

    // Mutate storage directly, bypassing the store, to prove getState re-reads.
    const persisted = await local.get(['visits']);
    const visits = persisted.visits as unknown[];
    await local.set({
      visits: [
        ...visits,
        {
          pageId: 'run.top',
          params: {},
          visitCount: 1,
          lastVisitedAt: 1000,
        },
      ],
    });

    const state = await store.getState();
    expect(state.visits).toHaveLength(2);
  });
});

describe('VisitStore.recordProject', () => {
  test('records a project without a matched page', async () => {
    const local = fakeStorage();
    const store = new VisitStore(local, undefined, () => 2000);

    await store.recordProject('lonely-project');

    const state = await store.getState();
    expect(state.projects).toEqual([
      {project: 'lonely-project', visitCount: 1, lastVisitedAt: 2000},
    ]);
    expect(state.visits).toEqual([]);
  });

  test('increments visitCount for a repeated project', async () => {
    const local = fakeStorage();
    const store = new VisitStore(local, undefined, () => 2000);

    await store.recordProject('proj');
    await store.recordProject('proj');

    const state = await store.getState();
    expect(state.projects).toEqual([
      {project: 'proj', visitCount: 2, lastVisitedAt: 2000},
    ]);
  });

  test('prunes the lowest-frecency project once over the cap', async () => {
    const local = fakeStorage({
      schemaVersion: 2,
      visits: [],
      projects: Array.from({length: 50}, (_, i) => ({
        project: `proj-${i}`,
        visitCount: 1,
        lastVisitedAt: i === 0 ? 0 : 100_000,
      })),
    });
    const store = new VisitStore(local, undefined, () => 100_000);

    await store.recordProject('proj-new');

    const state = await store.getState();
    expect(state.projects).toHaveLength(50);
    expect(state.projects.some(p => p.project === 'proj-0')).toBe(false);
    expect(state.projects.some(p => p.project === 'proj-new')).toBe(true);
  });
});
