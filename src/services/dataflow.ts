import {ServiceDef} from '../catalog.ts';

export const dataflow: ServiceDef = {
  id: 'dataflow',
  name: 'Dataflow',
  pages: [
    {
      id: 'dataflow.jobs',
      name: 'Jobs',
      pattern: '/dataflow/jobs',
      examples: [
        'https://console.cloud.google.com/dataflow/jobs?project=my-project',
      ],
    },
  ],
};
