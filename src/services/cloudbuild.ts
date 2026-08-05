import {ServiceDef} from '../catalog.ts';

export const cloudbuild: ServiceDef = {
  id: 'cloudbuild',
  name: 'Cloud Build',
  aliases: ['gcb'],
  pages: [
    {
      id: 'cloudbuild.builds',
      name: 'History',
      pattern: '/cloud-build/builds',
      examples: [
        'https://console.cloud.google.com/cloud-build/builds?project=my-project',
      ],
    },
    {
      id: 'cloudbuild.triggers',
      name: 'Triggers',
      pattern: '/cloud-build/triggers',
      examples: [
        'https://console.cloud.google.com/cloud-build/triggers?project=my-project',
      ],
    },
  ],
};
