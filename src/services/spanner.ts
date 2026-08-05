import {ServiceDef} from '../catalog.ts';

export const spanner: ServiceDef = {
  id: 'spanner',
  name: 'Spanner',
  pages: [
    {
      id: 'spanner.instances',
      name: 'Instances',
      pattern: '/spanner/instances',
      examples: [
        'https://console.cloud.google.com/spanner/instances?project=my-project',
      ],
    },
    {
      id: 'spanner.instance',
      name: 'Instance',
      pattern: '/spanner/instances/:instance/details/databases',
      resource: {kind: 'Instance', nameParam: 'instance'},
      examples: [
        'https://console.cloud.google.com/spanner/instances/my-instance/details/databases?project=my-project',
        'https://console.cloud.google.com/spanner/instances/my-instance/details/databases/my-db?project=my-project',
      ],
    },
  ],
};
