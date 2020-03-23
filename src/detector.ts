import {Feature, products} from './products';
import {Resource, resources} from './resource';

export interface DetectionResult {
  project?: string;
  feature?: Feature;
  resource?: Resource;
}

export function detect(input: string): DetectionResult | null {
  const url = new URL(input);
  const project = url.searchParams.get('project') || undefined;
  const feature = detectFeature(url);
  const resource = project ? detectResource(url) : undefined;
  return {
    project,
    feature,
    resource: resource ? {...resource, project: project!} : undefined,
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

function detectResource(url: URL): Omit<Resource, 'project'> | undefined {
  let resource: Omit<Resource, 'project'> | undefined;
  resources.find(r => {
    resource = r.parse(url);
    return resource ? true : false;
  });
  return resource;
}
