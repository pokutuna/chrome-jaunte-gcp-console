import {Resource} from './products';
import {DetectionResult} from './detector';

export type BrowserStorage = Pick<
  chrome.storage.StorageArea,
  'set' | 'get' | 'remove'
>;

const maxProjects = 20;
const maxFeatures = 20;
const maxResources = 30;

export interface JaunteState {
  projects: string[];
  featurePaths: string[];
  resources: Resource[];
}

export class StorageService {
  storage: BrowserStorage;

  lastState?: JaunteState;

  constructor(storage: BrowserStorage) {
    this.storage = storage;
  }

  async getState(): Promise<JaunteState> {
    return this.lastState ? this.lastState : await this.loadStates();
  }

  dropState() {
    this.lastState = undefined;
  }

  loadStates(): Promise<JaunteState> {
    const p = new Promise<JaunteState>((resolve, reject) => {
      this.storage.get(
        ['projects', 'featurePaths', 'resources'],
        (state: Partial<JaunteState>) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
            return;
          }

          const res: JaunteState = {
            projects: state.projects || [],
            featurePaths: state.featurePaths || [],
            resources: state.resources || [],
          };
          this.lastState = res;
          resolve(res);
          return;
        }
      );
    });
    p.then(console.log);
    return p;
  }

  updateState(state: Partial<JaunteState>): Promise<void> {
    console.log('update', state);
    return new Promise((resolve, reject) => {
      this.storage.set(state, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }
        this.dropState();
        resolve();
      });
    });
  }

  checkUpdateAndReorder<T>(
    state: T[],
    value: T | undefined,
    cmp: (a: T, b: T) => boolean,
    keep: number
  ): T[] | undefined {
    if (!value) return;
    if (cmp(state[0], value)) return;

    const current = state;
    const index = current.findIndex(v => cmp(v, value));
    if (0 < index) current.splice(index, 1);
    return [value, ...current.slice(0, keep)];
  }

  async handleDetectionResult(result: DetectionResult): Promise<void> {
    const update: Partial<JaunteState> = {};
    const state = await this.getState();

    const projects = this.checkUpdateAndReorder(
      state.projects,
      result.projectId,
      (a, b) => a === b,
      maxProjects
    );
    if (projects) update.projects = projects;

    const featurePaths = this.checkUpdateAndReorder(
      state.featurePaths,
      result.feature?.path,
      (a, b) => a === b,
      maxFeatures
    );
    if (featurePaths) update.featurePaths = featurePaths;

    const resources = this.checkUpdateAndReorder(
      state.resources,
      result.resource,
      (a, b) => a && b && a.name === b.name && a.path === b.path,
      maxResources
    );
    if (resources) update.resources = resources;

    if (Object.keys(update).length !== 0) this.updateState(update);
  }
}
