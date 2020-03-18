import {escapeXML as escape} from './util';
import {detect} from './detector';
import {JaunteState, StorageService} from './storage';
import {search} from './search';

const storage = new StorageService(chrome.storage.sync);

type SuggestCallback = (suggestResults: chrome.omnibox.SuggestResult[]) => void;

class JauntePresenter {
  startState?: Promise<JaunteState>;

  isInputtingProject = false;
  selectedProject = '';

  onStart() {
    this.updateDefaultSuggestion('');
    this.startState = storage.getStates();
  }

  async onInput(input: string, suggest: SuggestCallback) {
    this.updateDefaultSuggestion(input);
    if (input === '') return;

    const state = await this.startState!;
    const tokens = input.split(' ').filter(s => s !== '' && !/\s/.test(s));
    const items = search(tokens, state, undefined);

    console.log(items);

    if (0 < items.length) {
      suggest(
        items.map(i => {
          const url = `https://console.cloud.google.com${i.feature.path}?project=${i.project}`;
          const description = `<dim>${escape(
            i.feature.productName
          )}</dim> - ${escape(i.feature.name)} / <dim>project:</dim> ${
            i.project
          } <url>${url}</url>`;
          return {content: url, description};
        })
      );
    } else {
      // TODO handle matched project or recent project
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

  onEnter(
    content: string,
    disposition: chrome.omnibox.OnInputEnteredDisposition
  ) {
    if (!/^https?:\/\//.test(content)) {
      console.error(`Content must be a URL: ${content}`);
      return;
    }

    const url = content;
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

  updateDefaultSuggestion(input: string, noResult?: boolean) {
    if (noResult) {
      chrome.omnibox.setDefaultSuggestion({
        description: `Empty result`,
      });
    } else {
      chrome.omnibox.setDefaultSuggestion({
        description: `${input} <url>p:project</url>`,
      });
    }
  }

  resetAllStates() {
    this.updateDefaultSuggestion('');
  }
}

const jaunte = new JauntePresenter();

chrome.omnibox.onInputStarted.addListener(() => {
  console.log('onInputStarted');
  jaunte.onStart();
});

chrome.omnibox.onInputChanged.addListener((input, suggest) => {
  console.log('onInputChanged', input);
  jaunte.onInput(input, suggest);
});

chrome.omnibox.onInputEntered.addListener((content, disposition) => {
  console.log('onInputEntered', content, disposition);
  jaunte.onEnter(content, disposition);
});

chrome.omnibox.onInputCancelled.addListener(() => {
  console.log('onInputCancelled');
  jaunte.resetAllStates();
});

chrome.omnibox.onDeleteSuggestion.addListener(text => {
  console.log('onDeleteSuggestion', text);
});

// TODO make configurable tracking project & product
// TODO popup and notify detect new project
chrome.tabs.onUpdated.addListener(
  (
    _tabId: number,
    changeInfo: chrome.tabs.TabChangeInfo,
    tab: chrome.tabs.Tab
  ) => {
    if (changeInfo.status !== 'complete' || !tab.url) return;

    const result = detect(tab.url);
    if (result?.projectId) storage.updateMostRecentProjectId(result.projectId);
  }
);
