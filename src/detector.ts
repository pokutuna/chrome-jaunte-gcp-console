import {Feature, Resource, products, resources} from './products';

export interface DetectionResult {
  projectId?: string;
  feature?: Feature;
  resource?: Resource;
}

export function detect(input: string): DetectionResult | null {
  const url = new URL(input);
  const projectId = url.searchParams.get('project') || undefined;
  const feature = detectFeature(url);
  const resource = detectResource(url);
  return {
    projectId,
    feature,
    resource,
  };
}

function detectFeature(url: URL): Feature | undefined {
  const pathname = url.pathname;
  return products.reduce(
    (res, p) =>
      pathname.startsWith(p.path) && (res?.path?.length || 0) < p.path.length
        ? p
        : res,
    undefined as Feature | undefined
  );
}

function detectResource(url: URL): Resource | undefined {
  let resource: Resource | undefined;
  resources.find(r => {
    resource = r.parse(url);
    return resource ? true : false;
  });
  return resource;
}
