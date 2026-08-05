import {ServiceDef} from '../catalog.ts';

export const vertexai: ServiceDef = {
  id: 'vertexai',
  name: 'Vertex AI',
  pages: [
    {
      id: 'vertexai.top',
      name: 'Vertex AI',
      pattern: '/vertex-ai',
      examples: [
        'https://console.cloud.google.com/vertex-ai?project=my-project',
      ],
    },
  ],
};
