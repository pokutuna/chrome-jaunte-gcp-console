import {ServiceDef} from '../catalog.ts';

export const cloudscheduler: ServiceDef = {
  id: 'cloudscheduler',
  name: 'Cloud Scheduler',
  pages: [
    {
      id: 'cloudscheduler.top',
      name: 'Cloud Scheduler',
      pattern: '/cloudscheduler',
      examples: [
        'https://console.cloud.google.com/cloudscheduler?project=my-project',
      ],
    },
  ],
};
