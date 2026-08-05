import {ServiceDef} from '../catalog.ts';

export const errors: ServiceDef = {
  id: 'errors',
  name: 'Error Reporting',
  pages: [
    {
      id: 'errors.top',
      name: 'Error Reporting',
      pattern: '/errors',
      examples: ['https://console.cloud.google.com/errors?project=my-project'],
    },
  ],
};
