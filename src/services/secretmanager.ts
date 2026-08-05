import {ServiceDef} from '../catalog.ts';

export const secretmanager: ServiceDef = {
  id: 'secretmanager',
  name: 'Secret Manager',
  pages: [
    {
      id: 'secretmanager.top',
      name: 'Secrets',
      pattern: '/security/secret-manager',
      examples: [
        'https://console.cloud.google.com/security/secret-manager?project=my-project',
      ],
    },
    {
      id: 'secretmanager.secret',
      name: 'Secret',
      pattern: '/security/secret-manager/secret/:secret/versions',
      resource: {kind: 'Secret', nameParam: 'secret'},
      examples: [
        'https://console.cloud.google.com/security/secret-manager/secret/my-secret/versions?project=my-project',
        'https://console.cloud.google.com/security/secret-manager/secret/my-secret/versions/1?project=my-project',
      ],
    },
  ],
};
