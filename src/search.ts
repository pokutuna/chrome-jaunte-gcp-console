import {products, Product, Feature} from './products';
import {Resource} from './resource';
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

function matchResource(input: string, resource: Resource): boolean {
  return (
    resource.uniqueName.toLowerCase().includes(input) ||
    resource.path.toLowerCase().includes(input) ||
    resource.project.toLowerCase().includes(input)
  );
}

//function resourceToItem(resource: Resource): MatchedItem {
//  return {
//    project: resource.project,
//    feature: {
//      name:
//    }
//  }
//}

function featureCandidatesByToken(tokens: string[]) {
  return tokens.reduce((m, t) => {
    m[t] = new Set<FeatureCandidate>(candidates.filter(c => match(t, c)));
    return m;
  }, {} as {[token: string]: Set<FeatureCandidate>});
}

const recentResourceSize = 20;
const recentProjectSize = 8;

export interface MatchedItem {
  project: string;
  product: Product;
  feature: Feature;
}

export function search(tokens: string[], state: JaunteState): MatchedItem[] {
  tokens = tokens.map(t => t.toLocaleLowerCase());

  const items: MatchedItem[] = [];

  // search recent resources
  const resources = state.resources.slice(0, recentResourceSize);
  resources
    .filter(r => tokens.every(t => matchResource(t, r)))
    .forEach(resource => {});

  // search projects * features
  const projects = state.projects.slice(0, recentProjectSize);
  const tokenToFeatures = featureCandidatesByToken(tokens);
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
