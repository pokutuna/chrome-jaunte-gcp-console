import {escapeXML as escape, wrapMatchedWord} from './util';
import {Feature, Product} from './products';
import {Item} from './search';

const sep = ' <dim>-</dim> ';

const console = 'https://console.cloud.google.com';

export function formatMatchedItem(
  inputs: string[],
  item: Item
): chrome.omnibox.SuggestResult {
  const content = `${console}${item.feature.path}?project=${item.project}`;
  const words = inputs.map(escape);
  const wrapMatch = (input: string) =>
    words.reduce(
      (t, w) => wrapMatchedWord(t, w, ['<match>', '</match>']),
      input
    );

  const parts = [item.product.name, item.feature.name, content]
    .map(escape)
    .map(wrapMatch);

  const description = `<dim>${parts[0]}</dim>${sep}${parts[1]}${sep}<url>${parts[2]}</url>`;
  return {content, description};
}

export function defaultInputHelper(input: string): string {
  return `<dim>[ GCP Products | Projects | Resources | URL ] <match>${input}</match></dim>`;
}

export const emptyResult = '<dim>Emtpy Result</dim>';
