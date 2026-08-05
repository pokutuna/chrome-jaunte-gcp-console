import {ServiceDef} from '../catalog.ts';

export const appengine: ServiceDef = {
  id: 'appengine',
  name: 'App Engine',
  aliases: ['gae'],
  pages: [
    {
      id: 'appengine.top',
      name: 'Dashboard',
      pattern: '/appengine',
      examples: [
        'https://console.cloud.google.com/appengine?project=my-project',
      ],
    },
    {
      id: 'appengine.services',
      name: 'Services',
      pattern: '/appengine/services',
      examples: [
        'https://console.cloud.google.com/appengine/services?project=my-project',
      ],
    },
    {
      id: 'appengine.service',
      name: 'Service',
      pattern: '/appengine/versions',
      query: {serviceId: ':service'},
      resource: {kind: 'Service', nameParam: 'service'},
      examples: [
        'https://console.cloud.google.com/appengine/versions?serviceId=default&project=my-project',
      ],
    },
  ],
};
