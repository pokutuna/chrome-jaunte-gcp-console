import {ServiceDef} from '../catalog.ts';

export const logging: ServiceDef = {
  id: 'logging',
  name: 'Logging',
  aliases: ['logs', 'logging'],
  pages: [
    {
      id: 'logging.query',
      name: 'Logs Explorer',
      pattern: '/logs/query',
      examples: [
        'https://console.cloud.google.com/logs/query?project=my-project',
      ],
    },
    {
      id: 'logging.metrics',
      name: 'Logs-based Metrics',
      pattern: '/logs/metrics',
      examples: [
        'https://console.cloud.google.com/logs/metrics?project=my-project',
      ],
    },
    {
      id: 'logging.router',
      name: 'Logs Router',
      pattern: '/logs/router',
      examples: [
        'https://console.cloud.google.com/logs/router?project=my-project',
      ],
    },
  ],
};
