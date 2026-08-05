import {matchUrl, ServiceDef} from './catalog.ts';
import * as format from './formatter.ts';
import {search} from './search.ts';
import {extractURL} from './util.ts';
import {VisitStore} from './visits.ts';

type SuggestCallback = (suggestResults: chrome.omnibox.SuggestResult[]) => void;

export function tokenize(input: string): string[] {
  return input.split(' ').filter(s => 1 < s.length && !/\s/.test(s));
}

const recentCheckWindowMs = 3000;

export class Jaunte {
  private store: VisitStore;
  private services: ServiceDef[];
  private lastChecked: {[url: string]: number} = {};

  constructor(store: VisitStore, services: ServiceDef[]) {
    this.store = store;
    this.services = services;
  }

  onStart() {
    this.updateDefaultSuggestion('', false);
  }

  async onInput(input: string, suggest: SuggestCallback) {
    if (input === '') return;

    const tokens = tokenize(input).map(t => t.toLowerCase());
    const state = await this.store.getState();
    const now = Date.now();
    const candidates = search(tokens, this.services, state, now);

    console.log(candidates);

    if (0 < candidates.length) {
      this.updateDefaultSuggestion(input, false);
      suggest(candidates.map(c => format.formatCandidate(tokens, c)));
    } else {
      this.updateDefaultSuggestion(input, true);
      suggest(
        state.projects.map(({project}) => {
          const url = `https://console.cloud.google.com/?project=${project}`;
          return {
            content: url,
            description: `<dim>project:</dim> ${project} <url>${url}</url>`,
          };
        }),
      );
    }
  }

  onEnter(
    input: string,
    disposition: `${chrome.omnibox.OnInputEnteredDisposition}`,
  ) {
    const url = extractURL(input);
    if (!url) return;

    switch (disposition) {
      case 'currentTab':
        chrome.tabs.update({url});
        break;
      case 'newForegroundTab':
        chrome.tabs.create({url});
        break;
      case 'newBackgroundTab':
        chrome.tabs.create({url, active: false});
        break;
    }
  }

  onCancel() {
    this.updateDefaultSuggestion('', false);
  }

  updateDefaultSuggestion(input: string, noResult?: boolean) {
    const description = noResult
      ? format.emptyResult
      : format.defaultInputHelper(input);
    chrome.omnibox.setDefaultSuggestion({description});
  }

  private isRecentlyChecked(url: string): boolean {
    const checkedAt = this.lastChecked[url] || 0;
    const checked = Date.now() <= checkedAt + recentCheckWindowMs;
    if (!checked) {
      this.lastChecked[url] = Date.now();
    }
    return checked;
  }

  onNavigation(url: string) {
    if (this.isRecentlyChecked(url)) return;

    const hit = matchUrl(this.services, url);
    console.log(url, hit);
    if (hit) {
      this.store.record(hit);
      return;
    }

    const project = new URL(url).searchParams.get('project');
    if (project) this.store.recordProject(project);
  }
}
