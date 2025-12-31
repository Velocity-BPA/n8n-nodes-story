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
    displayName: 'IP ID',
    name: 'ipId',
    type: 'string',
    required: true,
    default: '',
    placeholder: '0x...',
    description: 'The IP Asset ID to retrieve',
    displayOptions: {
      show: {
        resource: ['ipAsset'],
        operation: ['get'],
      },
    },
  },
];

export async function execute(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const ipId = this.getNodeParameter('ipId', index) as string;

  if (!ipId) {
    throw new NodeOperationError(this.getNode(), 'IP ID is required', { itemIndex: index });
  }

  const apiClient = await getStoryApiClient(this);

  try {
    const ipAsset = await apiClient.getIPAsset(ipId);

    return [
      {
        json: {
          ...ipAsset,
        },
        pairedItem: { item: index },
      },
    ];
  } catch (error) {
    throw new NodeOperationError(
      this.getNode(),
      `Failed to get IP Asset: ${(error as Error).message}`,
      { itemIndex: index },
    );
  }
}
