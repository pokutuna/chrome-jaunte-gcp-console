import {ServiceDef} from '../catalog.ts';

export const pubsub: ServiceDef = {
  id: 'pubsub',
  name: 'Pub/Sub',
  aliases: ['pubsub'],
  pages: [
    {
      id: 'pubsub.topics',
      name: 'Topics',
      aliases: ['topic'],
      pattern: '/cloudpubsub/topic/list',
      examples: [
        'https://console.cloud.google.com/cloudpubsub/topic/list?project=my-project',
      ],
    },
    {
      id: 'pubsub.topic',
      name: 'Topic',
      pattern: '/cloudpubsub/topic/detail/:topic',
      resource: {kind: 'Topic', nameParam: 'topic'},
      examples: [
        'https://console.cloud.google.com/cloudpubsub/topic/detail/my-topic?project=my-project',
        'https://console.cloud.google.com/cloudpubsub/topic/detail/my-topic/metrics?project=my-project',
      ],
    },
    {
      id: 'pubsub.subscriptions',
      name: 'Subscriptions',
      aliases: ['sub'],
      pattern: '/cloudpubsub/subscription/list',
      examples: [
        'https://console.cloud.google.com/cloudpubsub/subscription/list?project=my-project',
      ],
    },
    {
      id: 'pubsub.subscription',
      name: 'Subscription',
      pattern: '/cloudpubsub/subscription/detail/:subscription',
      resource: {kind: 'Subscription', nameParam: 'subscription'},
      examples: [
        'https://console.cloud.google.com/cloudpubsub/subscription/detail/my-sub?project=my-project',
        'https://console.cloud.google.com/cloudpubsub/subscription/detail/my-sub/metrics?project=my-project',
      ],
    },
  ],
};
