import {ServiceDef} from '../catalog.ts';

export const iam: ServiceDef = {
  id: 'iam',
  name: 'IAM & Admin',
  aliases: ['iam'],
  pages: [
    {
      id: 'iam.iam',
      name: 'IAM',
      pattern: '/iam-admin/iam',
      examples: [
        'https://console.cloud.google.com/iam-admin/iam?project=my-project',
      ],
    },
    {
      id: 'iam.serviceaccounts',
      name: 'Service Accounts',
      aliases: ['sa'],
      pattern: '/iam-admin/serviceaccounts',
      examples: [
        'https://console.cloud.google.com/iam-admin/serviceaccounts?project=my-project',
      ],
    },
    {
      id: 'iam.quotas',
      name: 'Quotas',
      pattern: '/iam-admin/quotas',
      examples: [
        'https://console.cloud.google.com/iam-admin/quotas?project=my-project',
      ],
    },
  ],
};
