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

export class StoryProtocol implements ICredentialType {
  name = 'storyProtocol';
  displayName = 'Story Protocol';
  documentationUrl = 'https://docs.story.foundation';
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
      description: 'The Story Protocol network to connect to',
    },
    {
      displayName: 'RPC URL',
      name: 'rpcUrl',
      type: 'string',
      default: '',
      placeholder: 'https://aeneid.storyrpc.io',
      description:
        'Custom RPC URL (leave empty to use default for selected network)',
    },
    {
      displayName: 'Authentication Method',
      name: 'authMethod',
      type: 'options',
      options: [
        {
          name: 'Private Key',
          value: 'privateKey',
        },
        {
          name: 'Mnemonic',
          value: 'mnemonic',
        },
      ],
      default: 'privateKey',
      description: 'Method to authenticate with the blockchain',
    },
    {
      displayName: 'Private Key',
      name: 'privateKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      displayOptions: {
        show: {
          authMethod: ['privateKey'],
        },
      },
      description: 'Your wallet private key (64 hex characters without 0x prefix)',
    },
    {
      displayName: 'Mnemonic',
      name: 'mnemonic',
      type: 'string',
      typeOptions: {
        password: true,
        rows: 3,
      },
      default: '',
      displayOptions: {
        show: {
          authMethod: ['mnemonic'],
        },
      },
      description: 'Your 12 or 24 word recovery phrase',
    },
    {
      displayName: 'Derivation Path',
      name: 'derivationPath',
      type: 'string',
      default: "m/44'/60'/0'/0/0",
      displayOptions: {
        show: {
          authMethod: ['mnemonic'],
        },
      },
      description: 'HD wallet derivation path',
    },
    {
      displayName: 'Chain ID',
      name: 'chainId',
      type: 'number',
      default: 1315,
      description: 'The chain ID (auto-populated based on network selection)',
      hint: 'Mainnet: 1513, Aeneid Testnet: 1315',
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {},
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: '={{$credentials.rpcUrl || ($credentials.network === "mainnet" ? "https://mainnet.storyrpc.io" : "https://aeneid.storyrpc.io")}}',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_chainId',
        params: [],
        id: 1,
      }),
    },
  };
}
