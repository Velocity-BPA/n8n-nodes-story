/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class StoryApi implements ICredentialType {
  name = 'storyApi';
  displayName = 'Story Protocol API';
  documentationUrl = 'https://docs.story.foundation/docs/api-reference';
  properties: INodeProperties[] = [
    {
      displayName: 'Network',
      name: 'network',
      type: 'options',
      options: [
        {
          name: 'Aeneid Testnet',
          value: 'aeneid',
        },
        {
          name: 'Mainnet',
          value: 'mainnet',
        },
      ],
      default: 'aeneid',
      description: 'The Story Protocol network for API queries',
    },
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      description: 'Your Story Protocol API key',
    },
    {
      displayName: 'API Endpoint',
      name: 'apiEndpoint',
      type: 'string',
      default: '',
      placeholder: 'https://api.aeneid.story.foundation',
      description:
        'Custom API endpoint URL (leave empty to use default for selected network)',
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        'X-API-Key': '={{$credentials.apiKey}}',
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL:
        '={{$credentials.apiEndpoint || ($credentials.network === "mainnet" ? "https://api.story.foundation" : "https://api.aeneid.story.foundation")}}',
      url: '/api/v1/health',
      method: 'GET',
    },
  };
}
