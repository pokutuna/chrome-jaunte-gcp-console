import {BrowserStorage, JaunteState, StorageService} from './storage';
import {detect} from './detector';
import {search} from './search';
import {formatMatchedItem} from './formatter';
import {extractURL} from './util';

type SuggestCallback = (suggestResults: chrome.omnibox.SuggestResult[]) => void;

export function tokenize(input: string): string[] {
  return input.split(' ').filter(s => 1 < s.length && !/\s/.test(s));
}

export class Jaunte {
  storage: StorageService;

  constructor(bs: BrowserStorage) {
    this.storage = new StorageService(bs);
  }

  onStart() {
    this.updateDefaultSuggestion('', false);
  }

  async onInput(input: string, suggest: SuggestCallback) {
    if (input === '') return;

    const tokens = tokenize(input);
    const state = await this.storage.getState();
    const items = search(tokens, state);

    console.log(items);

    if (0 < items.length) {
      this.updateDefaultSuggestion(input, false);
      suggest(items.map(i => formatMatchedItem(tokens, i)));
    } else {
      this.updateDefaultSuggestion(input, true);
      // todo replace
      suggest(
        state.projects.map(projectId => {
          const url = `https://console.cloud.google.com/?project=${projectId}`;
          return {
            content: url,
            description: `<dim>project:</dim> ${projectId} <url>${url}</url>`,
          };
        })
      );
    }
  }

  onEnter(
    input: string,
    disposition: chrome.omnibox.OnInputEnteredDisposition
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
    let description =
      '<dim>[ GCP Products | Projects | Resources | URL ]</dim>';
    if (noResult) {
      description = '<dim>Emtpy Result</dim>';
    }
    chrome.omnibox.setDefaultSuggestion({description});
  }

  lastChecked: {[url: string]: number} = {};
  isRecentCheckedURL(url: string): boolean {
    const checkedAt = this.lastChecked[url] || 0;
    const checked = Date.now() <= checkedAt + 3000;
    if (!checked) {
      this.lastChecked[url] = Date.now();
    }
    return checked;
  }

  onTabsUpdateConsoleURL(
    _tabId: number,
    changeInfo: chrome.tabs.TabChangeInfo,
    tab: chrome.tabs.Tab
  ) {
    if (changeInfo.status !== 'complete' || !tab.url) return;
    if (this.isRecentCheckedURL(tab.url)) return;

    const result = detect(tab.url);
    console.log(tab.url, result);
    if (result) this.storage.handleDetectionResult(result);
  }
}
