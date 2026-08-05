import {ServiceDef} from '../catalog.ts';

export const cloudtasks: ServiceDef = {
  id: 'cloudtasks',
  name: 'Cloud Tasks',
  pages: [
    {
      id: 'cloudtasks.top',
      name: 'Queues',
      pattern: '/cloudtasks',
      examples: [
        'https://console.cloud.google.com/cloudtasks?project=my-project',
      ],
    },
    {
      id: 'cloudtasks.queue',
      name: 'Queue',
      pattern: '/cloudtasks/queue/:location/:queue/tasks',
      resource: {kind: 'Queue', nameParam: 'queue'},
      examples: [
        'https://console.cloud.google.com/cloudtasks/queue/asia-northeast1/my-queue/tasks?project=my-project',
        'https://console.cloud.google.com/cloudtasks/queue/asia-northeast1/my-queue/tasks/details?project=my-project',
      ],
    },
  ],
};
