import {ServiceDef} from '../catalog.ts';

export const apis: ServiceDef = {
  id: 'apis',
  name: 'APIs & Services',
  pages: [
    {
      id: 'apis.dashboard',
      name: 'Dashboard',
      pattern: '/apis/dashboard',
      examples: [
        'https://console.cloud.google.com/apis/dashboard?project=my-project',
      ],
    },
    {
      id: 'apis.library',
      name: 'Library',
      pattern: '/apis/library',
      examples: [
        'https://console.cloud.google.com/apis/library?project=my-project',
      ],
    },
  ],
};
