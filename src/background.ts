import {escapeXML as escape} from './util';
import {products} from './products';
import {detect} from './detector';
import {JaunteState, StorageService} from './storage';
import {searchCandidates} from './search';

const storage = new StorageService(chrome.storage.sync);

type SuggestCallback = (suggestResults: chrome.omnibox.SuggestResult[]) => void;

class JauntePresenter {
  startState?: Promise<JaunteState>;

  onStart() {
    this.updateDefaultSuggestion('');
    this.startState = storage.getStates();
  }

  async onInput(input: string, suggest: SuggestCallback) {
    this.updateDefaultSuggestion(input);
    if (input === '') return;

    const state = await this.startState!;
    const result = searchCandidates(input, state);

    const recentProjects = state.visitedProjectIdList || [];

    // TODO move these logics to search
    if (result) {
      console.log(result);

      const projects = (result.projects.length !== 0
        ? result.projects
        : [...recentProjects]
      ).splice(0, 3);
      const hasConsoles =
        result.products.length !== 0 || result.features.length !== 0;

      if (hasConsoles) {
        const suggests: chrome.omnibox.SuggestResult[] = [];
        if (result.features.length !== 0) {
          result.features.forEach(f => {
            // awful search
            const parent = products.find(p =>
              p.features.some(i => i.path === f.path)
            )!;
            projects.forEach(p => {
              const url = `https://console.cloud.google.com${f.path}?project=${p}`;
              suggests.push({
                content: url,
                description: `<dim>${escape(
                  parent.name
                )}</dim> - <match>${escape(
                  f.name
                )}</match> / <dim>project:</dim> ${p} <url>${url}</url>`,
              });
            });
          });
        } else {
          result.products.forEach(pd => {
            projects.forEach(pj => {
              const url = `https://console.cloud.google.com${pd.path}?project=${pj}`;
              suggests.push({
                content: url,
                description: `<match>${escape(
                  pd.name
                )}</match> <dim>project:</dim> ${pj} <url>${url}</url>`,
              });
            });
          });
        }
        console.log(suggests);
        suggest(suggests);
      } else {
        // TODO handle matched project or recent project
        suggest(
          projects.map(projectId => {
            const url = `https://console.cloud.google.com/?project=${projectId}`;
            return {
              content: url,
              description: `<dim>project:</dim> ${projectId} <url>${url}</url>`,
            };
          })
        );
      }
    } else {
      this.updateDefaultSuggestion('', true);
      suggest(
        recentProjects.map(projectId => {
          const url = `https://console.cloud.google.com/?project=${projectId}`;
          return {
            content: url,
            description: `<dim>project:</dim> ${escape(
              projectId
            )} <url>${url}</url>`,
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
