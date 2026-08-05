import {Candidate} from './search.ts';
import {escapeXML as escape, wrapMatchedWord} from './util.ts';

const sep = ' <dim>-</dim> ';

export function formatCandidate(
  tokens: string[],
  c: Candidate,
): chrome.omnibox.SuggestResult {
  const label = c.resourceName
    ? `${c.resourceName} (${c.page.resource!.kind})`
    : c.page.name;

  const wrapMatch = (input: string) =>
    tokens.reduce(
      (t, w) => wrapMatchedWord(t, escape(w), ['<match>', '</match>']),
      input,
    );

  const parts = [c.service.name, label, c.url].map(escape).map(wrapMatch);

  const description = `<dim>${parts[0]}</dim>${sep}${parts[1]}${sep}<url>${parts[2]}</url>`;
  return {content: c.url, description};
}

export function defaultInputHelper(input: string): string {
  return `<dim>[ GCP Services | Projects | Resources | URL ] <match>${escape(input)}</match></dim>`;
}

export const emptyResult = '<dim>Empty Result</dim>';
