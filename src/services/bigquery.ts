import {ServiceDef} from '../catalog.ts';

export const bigquery: ServiceDef = {
  id: 'bigquery',
  name: 'BigQuery',
  aliases: ['bq'],
  pages: [
    {
      id: 'bigquery.top',
      name: 'BigQuery',
      pattern: '/bigquery',
      examples: [
        'https://console.cloud.google.com/bigquery?project=my-project',
      ],
    },
  ],
};
