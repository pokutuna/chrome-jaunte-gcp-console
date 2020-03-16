// using fields

type Storage = Pick<chrome.storage.StorageArea, 'set' | 'get' | 'remove'>;

export interface JaunteState {
  visitedProjectIdList?: string[];
}

export class StorageService {
  storage: Storage;

  state: JaunteState = {};
  loaded = false;

  constructor(storage: Storage) {
    this.storage = storage;
  }

  async getStates(): Promise<JaunteState> {
    if (this.loaded) return Promise.resolve(this.state);
    return this.loadStates();
  }

  async loadStates(): Promise<JaunteState> {
    return new Promise((resolve, reject) => {
      this.storage.get(['projects.visited'], items => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }

        const res = {
          visitedProjectIdList: items['projects.visited'] || [],
        };
        this.state = res;
        resolve(res);
        return;
      });
    });
  }

  async updateMostRecentProjectId(projectId: string): Promise<void> {
    if (this.state.visitedProjectIdList?.[0] === projectId) return;

    // reorder
    const current = this.state.visitedProjectIdList || [];
    const index = current.indexOf(projectId);
    if (0 < index) current.splice(index, 1);
    const updated = [projectId].concat(current);

    return new Promise((resolve, reject) => {
      this.storage.set(
        {
          'projects.visited': updated,
        },
        () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
            return;
          }
          resolve();
        }
      );
    });
  }
}
