import {ServiceDef} from '../catalog.ts';

export const functions: ServiceDef = {
  id: 'functions',
  name: 'Cloud Functions',
  aliases: ['gcf', 'functions'],
  pages: [
    {
      id: 'functions.list',
      name: 'Functions',
      pattern: '/functions/list',
      examples: [
        'https://console.cloud.google.com/functions/list?project=my-project',
      ],
    },
    {
      id: 'functions.detail',
      name: 'Function',
      pattern: '/functions/details/:region/:function',
      resource: {kind: 'Function', nameParam: 'function'},
      examples: [
        'https://console.cloud.google.com/functions/details/asia-northeast1/my-func?project=my-project',
        'https://console.cloud.google.com/functions/details/asia-northeast1/my-func/logs?project=my-project',
      ],
    },
  ],
};
