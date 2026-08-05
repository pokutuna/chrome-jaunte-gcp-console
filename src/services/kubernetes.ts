import {ServiceDef} from '../catalog.ts';

export const kubernetes: ServiceDef = {
  id: 'kubernetes',
  name: 'Kubernetes Engine',
  aliases: ['gke'],
  pages: [
    {
      id: 'kubernetes.clusters',
      name: 'Clusters',
      pattern: '/kubernetes/list/overview',
      examples: [
        'https://console.cloud.google.com/kubernetes/list/overview?project=my-project',
      ],
    },
    {
      id: 'kubernetes.cluster',
      name: 'Cluster',
      pattern: '/kubernetes/clusters/details/:location/:cluster',
      resource: {kind: 'Cluster', nameParam: 'cluster'},
      examples: [
        'https://console.cloud.google.com/kubernetes/clusters/details/asia-northeast1/my-cluster?project=my-project',
        'https://console.cloud.google.com/kubernetes/clusters/details/asia-northeast1/my-cluster/nodes?project=my-project',
      ],
    },
    {
      id: 'kubernetes.workloads',
      name: 'Workloads',
      pattern: '/kubernetes/workload/overview',
      examples: [
        'https://console.cloud.google.com/kubernetes/workload/overview?project=my-project',
      ],
    },
  ],
};
