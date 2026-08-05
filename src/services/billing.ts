import {ServiceDef} from '../catalog.ts';

export const billing: ServiceDef = {
  id: 'billing',
  name: 'Billing',
  pages: [
    {
      id: 'billing.top',
      name: 'Billing',
      pattern: '/billing',
      examples: ['https://console.cloud.google.com/billing?project=my-project'],
    },
  ],
};
