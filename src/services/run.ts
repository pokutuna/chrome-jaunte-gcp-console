import {ServiceDef} from '../catalog.ts';

export const run: ServiceDef = {
  id: 'run',
  name: 'Cloud Run',
  aliases: ['run'],
  pages: [
    {
      id: 'run.top',
      name: 'Services',
      pattern: '/run',
      examples: ['https://console.cloud.google.com/run?project=my-project'],
    },
    {
      id: 'run.service',
      name: 'Service',
      pattern: '/run/detail/:region/:service',
      resource: {kind: 'Service', nameParam: 'service'},
      examples: [
        'https://console.cloud.google.com/run/detail/asia-northeast1/my-api?project=my-project',
        'https://console.cloud.google.com/run/detail/asia-northeast1/my-api/metrics?project=my-project',
      ],
    },
    {
      id: 'run.jobs',
      name: 'Jobs',
      pattern: '/run/jobs',
      examples: [
        'https://console.cloud.google.com/run/jobs?project=my-project',
      ],
    },
    {
      id: 'run.job',
      name: 'Job',
      pattern: '/run/jobs/details/:region/:job',
      resource: {kind: 'Job', nameParam: 'job'},
      examples: [
        'https://console.cloud.google.com/run/jobs/details/asia-northeast1/my-job?project=my-project',
        'https://console.cloud.google.com/run/jobs/details/asia-northeast1/my-job/executions?project=my-project',
      ],
    },
  ],
};
