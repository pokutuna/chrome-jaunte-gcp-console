import {detectResource, Resource} from './products';

export interface DetectionResult {
  projectId?: string;
  resource?: Resource;
}

export function detect(input: string): DetectionResult | null {
  const url = new URL(input);
  const projectId = url.searchParams.get('project') || undefined;
  const resource = detectResource(url);
  return {
    projectId,
    resource,
  };
}
