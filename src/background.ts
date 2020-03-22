import {Jaunte} from './jaunte';

const jaunte = new Jaunte(chrome.storage.sync);

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

chrome.tabs.onUpdated.addListener(jaunte.onTabsUpdateConsoleURL);
