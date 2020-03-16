import {products, Product, Feature} from './products';
import {JaunteState} from './storage';

export interface ProjectSearchResult {
  projectIds: string[];
  found: boolean;
}

interface Token {
  chunk: string;
  matched: boolean;
}

interface SearchResult {
  projects: string[];
  products: Product[];
  features: Feature[];
}

export function searchCandidates(
  input: string,
  state: JaunteState
): SearchResult | undefined {
  const result: SearchResult = {
    projects: [],
    products: [],
    features: [],
  };

  const tokens: Token[] = input
    .split(' ')
    .filter(s => s !== '' && !/\s/.test(s))
    .map(chunk => ({
      chunk,
      matched: false,
    }));

  // projects
  (state.visitedProjectIdList || []).forEach(p => {
    let matched = false;
    tokens.forEach(t => {
      if (p.indexOf(t.chunk) !== -1) {
        matched = true;
        t.matched = t.matched || true;
      }
    });
    if (matched) result.projects.push(p);
  });

  // prodduct & feature
  // TODO sort by longest match
  // TODO sort by recent used
  products.forEach(p => {
    let pMatched = false;
    tokens.forEach(t => {
      if (p.name.indexOf(t.chunk) !== -1 || p.path.indexOf(t.chunk) !== -1) {
        pMatched = true;
        t.matched = t.matched || true;
      }
    });
    if (pMatched) result.products.push(p);

    p.features.forEach(f => {
      let fMatched = false;
      tokens.forEach(t => {
        if (f.name.indexOf(t.chunk) !== -1 || f.path.indexOf(t.chunk) !== -1) {
          fMatched = true;
          t.matched = t.matched || true;
        }
      });
      if (fMatched) result.features.push(f);
    });
  });

  const filled = tokens.every(t => t.matched);
  if (!filled) return undefined;

  // TODO return more descriptive model
  return result;
}
