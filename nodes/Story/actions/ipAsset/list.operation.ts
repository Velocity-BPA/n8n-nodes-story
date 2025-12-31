/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { getStoryApiClient } from '../../transport';

export const description: INodeProperties[] = [
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    description: 'Whether to return all results or only up to a given limit',
    displayOptions: {
      show: {
        resource: ['ipAsset'],
        operation: ['list'],
      },
    },
  },
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    typeOptions: {
      minValue: 1,
      maxValue: 100,
    },
    default: 50,
    description: 'Max number of results to return',
    displayOptions: {
      show: {
        resource: ['ipAsset'],
        operation: ['list'],
        returnAll: [false],
      },
    },
  },
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: {
      show: {
        resource: ['ipAsset'],
        operation: ['list'],
      },
    },
    options: [
      {
        displayName: 'Owner Address',
        name: 'owner',
        type: 'string',
        default: '',
        placeholder: '0x...',
        description: 'Filter by owner address',
      },
      {
        displayName: 'Token Contract',
        name: 'tokenContract',
        type: 'string',
        default: '',
        placeholder: '0x...',
        description: 'Filter by token contract address',
      },
    ],
  },
];

export async function execute(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const returnAll = this.getNodeParameter('returnAll', index) as boolean;
  const limit = returnAll ? 1000 : (this.getNodeParameter('limit', index) as number);
  const filters = this.getNodeParameter('filters', index, {}) as {
    owner?: string;
    tokenContract?: string;
  };

  const apiClient = await getStoryApiClient(this);

  try {
    const ipAssets = await apiClient.getIpAssets({
      ...filters,
      limit,
    });

    return ipAssets.map((asset) => ({
      json: { ...asset } as IDataObject,
      pairedItem: { item: index },
    }));
  } catch (error) {
    throw new NodeOperationError(
      this.getNode(),
      `Failed to list IP Assets: ${(error as Error).message}`,
      { itemIndex: index },
    );
  }
}
