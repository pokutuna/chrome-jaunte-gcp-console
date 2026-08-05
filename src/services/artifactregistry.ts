import {ServiceDef} from '../catalog.ts';

export const artifactregistry: ServiceDef = {
  id: 'artifactregistry',
  name: 'Artifact Registry',
  pages: [
    {
      id: 'artifactregistry.repositories',
      name: 'Repositories',
      pattern: '/artifacts',
      examples: [
        'https://console.cloud.google.com/artifacts?project=my-project',
      ],
    },
    {
      id: 'artifactregistry.repository',
      name: 'Repository',
      pattern: '/artifacts/:format/:proj/:location/:repository',
      resource: {kind: 'Repository', nameParam: 'repository'},
      examples: [
        'https://console.cloud.google.com/artifacts/docker/my-project/asia-northeast1/my-repo?project=my-project',
        'https://console.cloud.google.com/artifacts/docker/my-project/asia-northeast1/my-repo/my-image?project=my-project',
      ],
    },
  ],
};
