import {ServiceDef} from '../catalog.ts';

export const trace: ServiceDef = {
  id: 'trace',
  name: 'Trace',
  pages: [
    {
      id: 'trace.list',
      name: 'Trace List',
      pattern: '/traces/list',
      examples: [
        'https://console.cloud.google.com/traces/list?project=my-project',
      ],
    },
  ],
};
