import {products, Product, Feature} from './products';
import {intersection} from './util';
import {JaunteState} from './storage';

interface FeatureCandidate {
  product: Product;
  feature: Feature;
  lc: {
    productName: string;
    name: string;
    path: string;
  };
}

const candidates = products.reduce((is, product) => {
  const fs =
    product.features.length !== 0
      ? product.features.map(f => ({
          feature: f,
          product,
          lc: {
            productName: product.name.toLowerCase(),
            name: f.name.toLowerCase(),
            path: f.path,
          },
        }))
      : {
          feature: product, // Product satisfies Feature
          product: product,
          lc: {
            productName: product.name.toLowerCase(),
            name: product.name.toLowerCase(),
            path: product.path,
          },
        };
  return is.concat(fs);
}, [] as FeatureCandidate[]);

function match(input: string, candidate: FeatureCandidate): boolean {
  return (
    candidate.lc.productName.includes(input) ||
    candidate.lc.name.includes(input) ||
    candidate.lc.path.includes(input)
  );
}

function featureCandidatesByToken(tokens: string[]) {
  return tokens.reduce((m, t) => {
    m[t] = new Set<FeatureCandidate>(candidates.filter(c => match(t, c)));
    return m;
  }, {} as {[token: string]: Set<FeatureCandidate>});
}

export interface Item {
  project: string;
  product: Product;
  feature: Feature;
}

export function search(tokens: string[], state: JaunteState): Item[] {
  tokens = tokens.map(t => t.toLocaleLowerCase());

  const projects = state.projects.slice(0, 8);
  const tokenToFeatures = featureCandidatesByToken(tokens);

  const items: Item[] = [];
  projects.forEach(project => {
    let cands = new Set(candidates);
    tokens.forEach(t => {
      if (!project.includes(t)) cands = intersection(cands, tokenToFeatures[t]);
    });

    // sort by candidates
    candidates.forEach(f => {
      if (cands.has(f))
        items.push({feature: f.feature, product: f.product, project});
    });
  });

  return items;
}
