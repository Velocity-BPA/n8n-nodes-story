/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { getStoryApiClient } from '../../transport';

export const description: INodeProperties[] = [
  {
    displayName: 'Metadata Action',
    name: 'metadataAction',
    type: 'options',
    options: [
      {
        name: 'Get Metadata',
        value: 'getMetadata',
        description: 'Get IP Asset metadata',
      },
      {
        name: 'Get by Token',
        value: 'getByToken',
        description: 'Get IP Asset by token contract and ID',
      },
      {
        name: 'Get Owners',
        value: 'getOwners',
        description: 'Get IP Asset owners',
      },
    ],
    default: 'getMetadata',
    displayOptions: {
      show: {
        resource: ['ipAsset'],
        operation: ['metadata'],
      },
    },
  },
  {
    displayName: 'IP ID',
    name: 'ipId',
    type: 'string',
    required: true,
    default: '',
    placeholder: '0x...',
    description: 'The IP Asset ID',
    displayOptions: {
      show: {
        resource: ['ipAsset'],
        operation: ['metadata'],
        metadataAction: ['getMetadata', 'getOwners'],
      },
    },
  },
  {
    displayName: 'Token Contract',
    name: 'tokenContract',
    type: 'string',
    required: true,
    default: '',
    placeholder: '0x...',
    description: 'The NFT contract address',
    displayOptions: {
      show: {
        resource: ['ipAsset'],
        operation: ['metadata'],
        metadataAction: ['getByToken'],
      },
    },
  },
  {
    displayName: 'Token ID',
    name: 'tokenId',
    type: 'string',
    required: true,
    default: '',
    description: 'The token ID',
    displayOptions: {
      show: {
        resource: ['ipAsset'],
        operation: ['metadata'],
        metadataAction: ['getByToken'],
      },
    },
  },
];

export async function execute(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const metadataAction = this.getNodeParameter('metadataAction', index) as string;
  const apiClient = await getStoryApiClient(this);

  try {
    switch (metadataAction) {
      case 'getMetadata': {
        const ipId = this.getNodeParameter('ipId', index) as string;
        const metadata = await apiClient.getIPAssetMetadata(ipId);

        return [
          {
            json: {
              ipId,
              ...metadata,
            },
            pairedItem: { item: index },
          },
        ];
      }

      case 'getByToken': {
        const tokenContract = this.getNodeParameter('tokenContract', index) as string;
        const tokenId = this.getNodeParameter('tokenId', index) as string;
        const ipAsset = await apiClient.getIPAssetByToken(tokenContract, tokenId);

        if (!ipAsset) {
          return [
            {
              json: {
                found: false,
                tokenContract,
                tokenId,
                message: 'No IP Asset found for this token',
              },
              pairedItem: { item: index },
            },
          ];
        }

        return [
          {
            json: {
              found: true,
              ...ipAsset,
            },
            pairedItem: { item: index },
          },
        ];
      }

      case 'getOwners': {
        const ipId = this.getNodeParameter('ipId', index) as string;
        const owners = await apiClient.getIPAssetOwners(ipId);

        return [
          {
            json: {
              ipId,
              owners,
              count: owners.length,
            },
            pairedItem: { item: index },
          },
        ];
      }

      default:
        throw new NodeOperationError(this.getNode(), `Unknown metadata action: ${metadataAction}`);
    }
  } catch (error) {
    throw new NodeOperationError(
      this.getNode(),
      `Metadata operation failed: ${(error as Error).message}`,
      { itemIndex: index },
    );
  }
}
