import type {PageHit} from './catalog.ts';

export interface Visit extends PageHit {
  lastVisitedAt: number; // epoch ms
  visitCount: number;
}

export interface ProjectVisit {
  project: string;
  lastVisitedAt: number;
  visitCount: number;
}

export interface VisitState {
  schemaVersion: number; // = 2
  visits: Visit[];
  projects: ProjectVisit[];
}

/** Narrow promise-based storage interface. chrome.storage.local satisfies this in MV3. */
export type StorageAreaLike = {
  get(keys: string[]): Promise<{[key: string]: unknown}>;
  set(items: {[key: string]: unknown}): Promise<void>;
};

const schemaVersion = 2;
const maxVisits = 500;
const maxProjects = 50;
const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

/** Frecency score: visitCount decayed with a 30 day half-life. */
export function frecency(
  v: {visitCount: number; lastVisitedAt: number},
  now: number,
): number {
  return v.visitCount * 0.5 ** ((now - v.lastVisitedAt) / thirtyDaysMs);
}

/** Stable identity key for a Visit, independent of params key order. */
function visitKey(hit: PageHit): string {
  const sortedParams = Object.fromEntries(
    Object.entries(hit.params).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)),
  );
  return JSON.stringify([hit.pageId, sortedParams, hit.project ?? '']);
}

interface LegacySyncState {
  projects?: string[];
}

export class VisitStore {
  private local: StorageAreaLike;
  private legacySync?: StorageAreaLike;
  private now: () => number;
  private cached?: VisitState;

  constructor(
    local: StorageAreaLike,
    legacySync?: StorageAreaLike,
    now: () => number = Date.now,
  ) {
    this.local = local;
    this.legacySync = legacySync;
    this.now = now;
  }

  async getState(): Promise<VisitState> {
    if (this.cached) return this.cached;

    const stored = await this.local.get([
      'schemaVersion',
      'visits',
      'projects',
    ]);
    if (typeof stored.schemaVersion === 'number') {
      const state: VisitState = {
        schemaVersion: stored.schemaVersion,
        visits: (stored.visits as Visit[] | undefined) || [],
        projects: (stored.projects as ProjectVisit[] | undefined) || [],
      };
      this.cached = state;
      return state;
    }

    const state = await this.migrate();
    this.cached = state;
    return state;
  }

  private async migrate(): Promise<VisitState> {
    let projects: ProjectVisit[] = [];
    if (this.legacySync) {
      const legacy = (await this.legacySync.get([
        'projects',
      ])) as LegacySyncState;
      const legacyProjects = legacy.projects || [];
      const now = this.now();
      projects = legacyProjects.map(project => ({
        project,
        visitCount: 1,
        lastVisitedAt: now,
      }));
    }

    const state: VisitState = {schemaVersion, visits: [], projects};
    await this.local.set({
      schemaVersion: state.schemaVersion,
      visits: state.visits,
      projects: state.projects,
    });
    return state;
  }

  async record(hit: PageHit): Promise<void> {
    const state = await this.getState();
    const now = this.now();
    const key = visitKey(hit);

    const existingIndex = state.visits.findIndex(v => visitKey(v) === key);
    let visits: Visit[];
    if (existingIndex >= 0) {
      const existing = state.visits[existingIndex];
      const updated: Visit = {
        ...existing,
        visitCount: existing.visitCount + 1,
        lastVisitedAt: now,
      };
      visits = [
        ...state.visits.slice(0, existingIndex),
        updated,
        ...state.visits.slice(existingIndex + 1),
      ];
    } else {
      visits = [...state.visits, {...hit, visitCount: 1, lastVisitedAt: now}];
    }
    visits = sortByFrecencyDesc(visits, now).slice(0, maxVisits);

    let projects = state.projects;
    if (hit.project) {
      projects = upsertProject(projects, hit.project, now);
      projects = sortByFrecencyDesc(projects, now).slice(0, maxProjects);
    }

    await this.save({schemaVersion, visits, projects});
  }

  async recordProject(project: string): Promise<void> {
    const state = await this.getState();
    const now = this.now();
    const projects = sortByFrecencyDesc(
      upsertProject(state.projects, project, now),
      now,
    ).slice(0, maxProjects);

    await this.save({
      schemaVersion: state.schemaVersion,
      visits: state.visits,
      projects,
    });
  }

  private async save(state: VisitState): Promise<void> {
    await this.local.set({
      schemaVersion: state.schemaVersion,
      visits: state.visits,
      projects: state.projects,
    });
    this.cached = undefined;
  }
}

function upsertProject(
  projects: ProjectVisit[],
  project: string,
  now: number,
): ProjectVisit[] {
  const index = projects.findIndex(p => p.project === project);
  if (index >= 0) {
    const existing = projects[index];
    const updated: ProjectVisit = {
      ...existing,
      visitCount: existing.visitCount + 1,
      lastVisitedAt: now,
    };
    return [...projects.slice(0, index), updated, ...projects.slice(index + 1)];
  }
  return [...projects, {project, visitCount: 1, lastVisitedAt: now}];
}

function sortByFrecencyDesc<
  T extends {visitCount: number; lastVisitedAt: number},
>(items: T[], now: number): T[] {
  return [...items].sort((a, b) => frecency(b, now) - frecency(a, now));
}
