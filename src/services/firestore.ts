import {ServiceDef} from '../catalog.ts';

export const firestore: ServiceDef = {
  id: 'firestore',
  name: 'Firestore',
  pages: [
    {
      id: 'firestore.databases',
      name: 'Databases',
      pattern: '/firestore/databases',
      examples: [
        'https://console.cloud.google.com/firestore/databases?project=my-project',
      ],
    },
    {
      id: 'firestore.database',
      name: 'Database',
      pattern: '/firestore/databases/:database/data',
      resource: {kind: 'Database', nameParam: 'database'},
      examples: [
        'https://console.cloud.google.com/firestore/databases/(default)/data?project=my-project',
        'https://console.cloud.google.com/firestore/databases/(default)/data/panel/users?project=my-project',
      ],
    },
  ],
};
