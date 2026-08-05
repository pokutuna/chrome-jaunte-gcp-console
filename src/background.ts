import {Jaunte} from './jaunte.ts';
import {services} from './services/index.ts';
import {VisitStore} from './visits.ts';

const store = new VisitStore(chrome.storage.local, chrome.storage.sync);
const jaunte = new Jaunte(store, services);

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
  jaunte.onCancel();
});

chrome.omnibox.onDeleteSuggestion.addListener(text => {
  console.log('onDeleteSuggestion', text);
});

const consoleUrlFilter: chrome.webNavigation.WebNavigationEventFilter = {
  url: [{hostEquals: 'console.cloud.google.com'}],
};

chrome.webNavigation.onCompleted.addListener(details => {
  if (details.frameId !== 0) return;
  jaunte.onNavigation(details.url);
}, consoleUrlFilter);

chrome.webNavigation.onHistoryStateUpdated.addListener(details => {
  if (details.frameId !== 0) return;
  jaunte.onNavigation(details.url);
}, consoleUrlFilter);
