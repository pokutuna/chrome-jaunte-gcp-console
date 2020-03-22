import {escapeXML as escape, wrapMatchedWord} from './util';
import {Feature, Product} from './products';

const sep = ' <dim>-</dim> ';

interface MatchedItem {
  product: Product;
  feature: Feature;
  project: string;
}

export function formatMatchedItem(
  inputs: string[],
  item: MatchedItem
): chrome.omnibox.SuggestResult {
  const content = `https://console.cloud.google.com${item.feature.path}?project=${item.project}`;
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
