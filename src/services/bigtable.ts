import {ServiceDef} from '../catalog.ts';

export const bigtable: ServiceDef = {
  id: 'bigtable',
  name: 'Bigtable',
  pages: [
    {
      id: 'bigtable.instances',
      name: 'Instances',
      pattern: '/bigtable/instances',
      examples: [
        'https://console.cloud.google.com/bigtable/instances?project=my-project',
      ],
    },
  ],
};
