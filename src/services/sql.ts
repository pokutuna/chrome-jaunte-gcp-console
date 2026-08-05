import {ServiceDef} from '../catalog.ts';

export const sql: ServiceDef = {
  id: 'sql',
  name: 'Cloud SQL',
  pages: [
    {
      id: 'sql.instances',
      name: 'Instances',
      pattern: '/sql/instances',
      examples: [
        'https://console.cloud.google.com/sql/instances?project=my-project',
      ],
    },
    {
      id: 'sql.instance',
      name: 'Instance',
      pattern: '/sql/instances/:instance/overview',
      resource: {kind: 'Instance', nameParam: 'instance'},
      examples: [
        'https://console.cloud.google.com/sql/instances/my-db/overview?project=my-project',
        'https://console.cloud.google.com/sql/instances/my-db/overview/monitoring?project=my-project',
      ],
    },
  ],
};
