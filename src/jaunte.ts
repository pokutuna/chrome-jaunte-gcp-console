import {BrowserStorage, JaunteState, StorageService} from './storage';
import {detect} from './detector';
import {search} from './search';
import {formatMatchedItem} from './formatter';

type SuggestCallback = (suggestResults: chrome.omnibox.SuggestResult[]) => void;

export function tokenize(input: string): string[] {
  return input.split(' ').filter(s => 1 < s.length && !/\s/.test(s));
}

export class Jaunte {
  storage: StorageService;
  state?: Promise<JaunteState>;

  constructor(bs: BrowserStorage) {
    this.storage = new StorageService(bs);
  }

  onStart() {
    this.updateDefaultSuggestion('', false);
    this.state = this.storage.getStates();
    this.state.then(s => console.log(s.visitedProjectIdList));
  }

  async onInput(input: string, suggest: SuggestCallback) {
    if (input === '') return;

    const tokens = tokenize(input);
    const state = await this.state!;
    const items = search(tokens, state);

    console.log(items);

    if (0 < items.length) {
      this.updateDefaultSuggestion(input, false);
      suggest(items.map(i => formatMatchedItem(tokens, i)));
    } else {
      this.updateDefaultSuggestion(input, true);
      // todo replace
      suggest(
        (state.visitedProjectIdList || []).map(projectId => {
          const url = `https://console.cloud.google.com/?project=${projectId}`;
          return {
            content: url,
            description: `<dim>project:</dim> ${projectId} <url>${url}</url>`,
          };
        })
      );
    }
  }

  onEnter(url: string, disposition: chrome.omnibox.OnInputEnteredDisposition) {
    if (!/^https?:\/\//.test(url)) {
      console.error(`Content must be a URL: ${url}`);
      return;
    }

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
    let description =
      '<dim>[ GCP Products | Projects | Resources | URL ]</dim>';
    if (noResult) {
      description = '<dim>Emtpy Result</dim>';
    }
    chrome.omnibox.setDefaultSuggestion({description});
  }

  onTabsUpdateConsoleURL(
    _tabId: number,
    changeInfo: chrome.tabs.TabChangeInfo,
    tab: chrome.tabs.Tab
  ) {
    if (changeInfo.status !== 'complete' || !tab.url) return;

    const result = detect(tab.url);
    if (result?.projectId)
      this.storage.updateMostRecentProjectId(result.projectId);
  }
}
