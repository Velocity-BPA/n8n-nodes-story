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
    description: 'The IP Asset ID to get royalty distribution for',
    displayOptions: {
      show: {
        resource: ['royalty'],
        operation: ['distribution'],
      },
    },
  },
  {
    displayName: 'Include Ancestors',
    name: 'includeAncestors',
    type: 'boolean',
    default: true,
    description: 'Whether to include ancestor distribution in the response',
    displayOptions: {
      show: {
        resource: ['royalty'],
        operation: ['distribution'],
      },
    },
  },
];

export async function execute(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const ipId = this.getNodeParameter('ipId', index) as string;
  const includeAncestors = this.getNodeParameter('includeAncestors', index, true) as boolean;

  const apiClient = await getStoryApiClient(this);

  try {
    // Get royalty information and policy
    const royalties = await apiClient.getRoyalties(ipId);

    // Get derivative info to understand lineage distribution
    let ancestors: unknown[] = [];
    if (includeAncestors) {
      try {
        const derivatives = await apiClient.getDerivatives({ parentIpId: ipId });
        ancestors = derivatives;
      } catch {
        // IP may not be a derivative
        ancestors = [];
      }
    }

    return [
      {
        json: {
          ipId,
          royalties,
          ancestors,
          includeAncestors,
        } as IDataObject,
        pairedItem: { item: index },
      },
    ];
  } catch (error) {
    throw new NodeOperationError(
      this.getNode(),
      `Failed to get royalty distribution: ${(error as Error).message}`,
      { itemIndex: index },
    );
  }
}
