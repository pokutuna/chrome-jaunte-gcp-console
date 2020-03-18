import {products, Product, Feature} from './products';
import {intersection} from './util';
import {JaunteState} from './storage';

interface FeatureCandidate extends Feature {
  productName: string;
}

const featureCandidates = products.reduce((is, product) => {
  const fs =
    product.features.length !== 0
      ? product.features.map(f => ({
          productName: product.name.toLowerCase(),
          name: f.name.toLowerCase(),
          path: f.path,
        }))
      : {
          productName: product.name,
          name: product.name,
          path: product.path,
        };
  return is.concat(fs);
}, [] as FeatureCandidate[]);

function match(input: string, feature: FeatureCandidate): boolean {
  return (
    feature.productName.includes(input) ||
    feature.name.includes(input) ||
    feature.path.includes(input)
  );
}

function featureCandidatesByToken(tokens: string[]) {
  return tokens.reduce((m, t) => {
    m[t] = new Set<FeatureCandidate>(
      featureCandidates.filter(f => match(t, f))
    );
    return m;
  }, {} as {[token: string]: Set<FeatureCandidate>});
}

export interface Item {
  feature: FeatureCandidate;
  project: string;
}

export function search(
  tokens: string[], // must be lower cased
  state: JaunteState,
  selectedProject: string | undefined
): Item[] {
  tokens = tokens.map(t => t.toLocaleLowerCase());

  const projects = selectedProject
    ? [selectedProject]
    : (state.visitedProjectIdList || []).slice(0, 10);

  const tokenToFeatures = featureCandidatesByToken(tokens);

  const items: Item[] = [];
  projects.forEach(p => {
    let features = new Set(featureCandidates);
    tokens.forEach(t => {
      if (!p.includes(t)) features = intersection(features, tokenToFeatures[t]);
    });
    featureCandidates.forEach(
      f => features.has(f) && items.push({feature: f, project: p})
    );
  });
  return items;
}
