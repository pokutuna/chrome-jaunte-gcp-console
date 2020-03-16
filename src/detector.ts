interface DetectionResult {
  projectId?: string;
}

export function detect(input: string): DetectionResult | null {
  const url = new URL(input);

  const projectId = url.searchParams.get('project');

  if (projectId) return {projectId};
  // TODO detect service & feature
  // TODO detect resource

  return null;
}
