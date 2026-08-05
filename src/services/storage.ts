import {ServiceDef} from '../catalog.ts';

export const storage: ServiceDef = {
  id: 'storage',
  name: 'Cloud Storage',
  aliases: ['gcs', 'bucket'],
  pages: [
    {
      id: 'storage.buckets',
      name: 'Buckets',
      pattern: '/storage/browser',
      examples: [
        'https://console.cloud.google.com/storage/browser?project=my-project',
      ],
    },
    {
      id: 'storage.bucket',
      name: 'Bucket',
      pattern: '/storage/browser/:bucket',
      resource: {kind: 'Bucket', nameParam: 'bucket'},
      examples: [
        'https://console.cloud.google.com/storage/browser/my-bucket?project=my-project',
        'https://console.cloud.google.com/storage/browser/my-bucket/some/prefix?project=my-project',
      ],
    },
  ],
};
