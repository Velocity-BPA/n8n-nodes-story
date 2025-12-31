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
    displayName: 'IP ID',
    name: 'ipId',
    type: 'string',
    required: true,
    default: '',
    placeholder: '0x...',
    description: 'The IP Asset ID to check royalty balance for',
    displayOptions: {
      show: {
        resource: ['royalty'],
        operation: ['balance'],
      },
    },
  },
  {
    displayName: 'Currency Token',
    name: 'currencyToken',
    type: 'string',
    required: false,
    default: '',
    placeholder: '0x...',
    description: 'Filter by specific currency token address',
    displayOptions: {
      show: {
        resource: ['royalty'],
        operation: ['balance'],
      },
    },
  },
];

export async function execute(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const ipId = this.getNodeParameter('ipId', index) as string;
  const currencyToken = this.getNodeParameter('currencyToken', index, '') as string;

  const apiClient = await getStoryApiClient(this);

  try {
    const royalties = await apiClient.getRoyalties(ipId);

    const filtered = currencyToken
      ? royalties.filter((r) => r.token?.toLowerCase() === currencyToken.toLowerCase())
      : royalties;

    return [
      {
        json: {
          ipId,
          balances: filtered,
          totalBalances: filtered.length,
        } as IDataObject,
        pairedItem: { item: index },
      },
    ];
  } catch (error) {
    throw new NodeOperationError(
      this.getNode(),
      `Failed to get royalty balance: ${(error as Error).message}`,
      { itemIndex: index },
    );
  }
}
