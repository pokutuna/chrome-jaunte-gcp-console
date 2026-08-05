import {ServiceDef} from '../catalog.ts';

export const compute: ServiceDef = {
  id: 'compute',
  name: 'Compute Engine',
  aliases: ['gce'],
  pages: [
    {
      id: 'compute.instances',
      name: 'VM instances',
      pattern: '/compute/instances',
      examples: [
        'https://console.cloud.google.com/compute/instances?project=my-project',
      ],
    },
    {
      id: 'compute.instance',
      name: 'Instance',
      pattern: '/compute/instancesDetail/zones/:zone/instances/:instance',
      resource: {kind: 'Instance', nameParam: 'instance'},
      examples: [
        'https://console.cloud.google.com/compute/instancesDetail/zones/asia-northeast1-a/instances/my-vm?project=my-project',
        'https://console.cloud.google.com/compute/instancesDetail/zones/asia-northeast1-a/instances/my-vm/monitoring?project=my-project',
      ],
    },
  ],
};
