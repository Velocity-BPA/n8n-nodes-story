/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { getStoryClient } from '../../transport';

export const description: INodeProperties[] = [
  {
    displayName: 'Resolve Type',
    name: 'resolveType',
    type: 'options',
    default: 'resolve',
    options: [
      { name: 'Resolve Dispute', value: 'resolve' },
      { name: 'Cancel Dispute', value: 'cancel' },
    ],
    description: 'Action to take on the dispute',
    displayOptions: {
      show: {
        resource: ['dispute'],
        operation: ['resolve'],
      },
    },
  },
  {
    displayName: 'Dispute ID',
    name: 'disputeId',
    type: 'number',
    required: true,
    default: 0,
    description: 'The dispute ID to resolve or cancel',
    displayOptions: {
      show: {
        resource: ['dispute'],
        operation: ['resolve'],
      },
    },
  },
  {
    displayName: 'Resolution Data',
    name: 'data',
    type: 'string',
    default: '0x',
    description: 'Additional data for the resolution (required for resolve, optional for cancel)',
    displayOptions: {
      show: {
        resource: ['dispute'],
        operation: ['resolve'],
      },
    },
  },
];

export async function execute(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const resolveType = this.getNodeParameter('resolveType', index) as string;
  const disputeId = this.getNodeParameter('disputeId', index) as number;
  const data = this.getNodeParameter('data', index) as string;

  if (disputeId < 0) {
    throw new NodeOperationError(this.getNode(), `Invalid dispute ID: ${disputeId}`, {
      itemIndex: index,
    });
  }

  const client = await getStoryClient(this);

  try {
    let result;

    if (resolveType === 'resolve') {
      result = await client.resolveDispute(disputeId, data || '0x');
    } else {
      result = await client.cancelDispute(disputeId, data || '0x');
    }

    return [
      {
        json: {
          success: result.status,
          action: resolveType,
          disputeId,
          transactionHash: result.hash,
          blockNumber: result.blockNumber,
          gasUsed: result.gasUsed,
          events: result.events,
        },
        pairedItem: { item: index },
      },
    ];
  } catch (error) {
    throw new NodeOperationError(
      this.getNode(),
      `Failed to ${resolveType} dispute: ${(error as Error).message}`,
      { itemIndex: index },
    );
  }
}
