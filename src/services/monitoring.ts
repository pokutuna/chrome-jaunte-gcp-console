import {ServiceDef} from '../catalog.ts';

export const monitoring: ServiceDef = {
  id: 'monitoring',
  name: 'Monitoring',
  pages: [
    {
      id: 'monitoring.top',
      name: 'Overview',
      pattern: '/monitoring',
      examples: [
        'https://console.cloud.google.com/monitoring?project=my-project',
      ],
    },
    {
      id: 'monitoring.dashboards',
      name: 'Dashboards',
      pattern: '/monitoring/dashboards',
      examples: [
        'https://console.cloud.google.com/monitoring/dashboards?project=my-project',
      ],
    },
    {
      id: 'monitoring.alerting',
      name: 'Alerting',
      pattern: '/monitoring/alerting',
      examples: [
        'https://console.cloud.google.com/monitoring/alerting?project=my-project',
      ],
    },
    {
      id: 'monitoring.metrics-explorer',
      name: 'Metrics Explorer',
      pattern: '/monitoring/metrics-explorer',
      examples: [
        'https://console.cloud.google.com/monitoring/metrics-explorer?project=my-project',
      ],
    },
    {
      id: 'monitoring.uptime',
      name: 'Uptime Checks',
      pattern: '/monitoring/uptime',
      examples: [
        'https://console.cloud.google.com/monitoring/uptime?project=my-project',
      ],
    },
  ],
};
